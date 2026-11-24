import math, os, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'out'
OUT.mkdir(exist_ok=True)
W,H = 1440,2560
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
ink = '#101a22'; cream = '#e7e2d4'; mint = '#99f3c1'; coral = '#ff826c'; muted = '#8b9b9c'
scenes = [
 ('01 / PERTANYAAN','INGATAN\nBISA SALAH?', 'Kamu yakin ingatanmu\nselalu akurat?', 'question', 5.0),
 ('02 / EKSPERIMEN','LIHAT\nSEKEJAP', 'Dalam sebuah eksperimen,\npeserta melihat huruf sekejap.', 'letters', 7.0),
 ('03 / ILUSI','C YANG\nTERBALIK', 'Beberapa huruf sengaja\ndibalik.', 'mirror', 7.0),
 ('04 / INGATAN','YANG DIINGAT\nBERBEDA', 'Banyak peserta mengingat\nhuruf itu sebagai C biasa.', 'compare', 8.0),
 ('05 / JEDA','SEMAKIN LAMA,\nSEMAKIN KELIRU', 'Kesalahan lebih sering muncul\nsetelah jeda yang lebih panjang.', 'timeline', 7.0),
 ('06 / PENJELASAN','OTAK MENGISI\nCELAH', 'Saat jejak ingatan melemah,\nbentuk akrab bisa mendominasi.', 'network', 8.0),
 ('07 / REFLEKSI','YAKIN ≠\nPASTI BENAR', 'Ingatan bukan rekaman\nvideo yang sempurna.', 'question', 7.2),
]
def text(draw, xy, s, size, color=cream, bold=False, mono=False, spacing=15):
    draw.multiline_text(xy,s,font=ImageFont.truetype(MONO if mono else (BOLD if bold else FONT),size),fill=color,spacing=spacing)
def center(draw, xy, s, size, color=cream, bold=True):
    f=ImageFont.truetype(BOLD if bold else FONT,size); draw.text(xy,s,font=f,fill=color,anchor='mm')
def board(i, scene):
    label,title,caption,kind,_=scene
    im=Image.new('RGB',(W,H),ink); d=ImageDraw.Draw(im)
    # Laboratory index and quiet ruled-paper texture, not the reference's atlas.
    for y in range(240,2110,80): d.line((90,y,1350,y),fill='#1b3038',width=2)
    d.rectangle((90,95,113,118), fill=mint)
    text(d,(140,83),'NAYSI / MIND LAB',30,muted,mono=True)
    text(d,(1030,83),'FIELD NOTES',26,muted,mono=True)
    text(d,(90,210),label,30,mint,mono=True)
    text(d,(85,285),title,112,cream,bold=True,spacing=0)
    d.line((90,620,1350,620),fill=mint,width=4)
    d.rounded_rectangle((90,700,1350,1840),radius=18,fill='#172b31',outline='#54736c',width=3)
    for k in range(7):
        x=150+k*185; d.line((x,730,x,1805),fill='#203a40',width=1)
    for k in range(6):
        y=770+k*190; d.line((120,y,1320,y),fill='#203a40',width=1)
    if kind=='letters':
        for j,c in enumerate(['C','E','Ɔ','F','R','P']):
            x=350+(j%3)*370;y=1020+(j//3)*410
            center(d,(x,y),c,245,coral if c=='Ɔ' else cream)
        text(d,(140,1730),'STIMULUS / HURUF',26,mint,mono=True)
    elif kind=='mirror':
        center(d,(720,1190),'Ɔ',650,coral)
        d.line((720,780,720,1680),fill=mint,width=4)
        text(d,(160,1690),'BENTUK DIBALIK',32,mint,mono=True)
    elif kind=='compare':
        d.line((720,850,720,1630),fill='#54736c',width=3)
        center(d,(410,1190),'Ɔ',390,coral);center(d,(1030,1190),'C',390,mint)
        text(d,(220,1510),'DILIHAT',35,coral,mono=True);text(d,(835,1510),'DIINGAT',35,mint,mono=True)
    elif kind=='timeline':
        d.line((220,1230,1200,1230),fill=mint,width=9)
        for j,x in enumerate((250,520,790,1160)):
            d.ellipse((x-20,1210,x+20,1250),fill=coral if j==3 else mint)
        text(d,(200,1350),'JEDA SINGKAT',31,cream,mono=True);text(d,(850,1350),'JEDA LEBIH LAMA',31,coral,mono=True)
        center(d,(720,1030),'WAKTU →',70,cream)
    elif kind=='network':
        nodes=[(350,1050),(720,890),(1050,1080),(530,1380),(930,1480),(710,1170)]
        for a,b in [(0,1),(1,2),(0,3),(3,4),(2,4),(5,0),(5,1),(5,2),(5,3),(5,4)]: d.line((*nodes[a],*nodes[b]),fill='#70b99c',width=7)
        for j,(x,y) in enumerate(nodes):
            r=76 if j==5 else 34; d.ellipse((x-r,y-r,x+r,y+r),fill=coral if j==5 else mint)
        text(d,(165,1660),'MEMORI + EKSPEKTASI',30,mint,mono=True)
    else:
        d.ellipse((300,830,1140,1670),outline='#527c71',width=5)
        center(d,(720,1240),'?',620,mint)
    text(d,(95,1930),caption,53,cream,bold=True,spacing=20)
    d.line((90,2350,1350,2350),fill='#3c5354',width=3)
    d.rectangle((90,2346,90+int(1260*(i+1)/len(scenes)),2354),fill=mint)
    text(d,(90,2390),f'{i+1:02d} / {len(scenes):02d}   •   MEMORY STUDY',26,muted,mono=True)
    p=OUT/f'scene-{i:02d}.png'; im.save(p); return p

def run():
    ff=imageio_ffmpeg.get_ffmpeg_exe(); parts=[]
    for i,s in enumerate(scenes):
        p=board(i,s); target=OUT/f'part-{i:02d}.mp4'; frames=round(s[4]*90)
        vf=f"zoompan=z='min(zoom+0.000035,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1440x2560:fps=90,format=yuv420p"
        subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-loop','1','-i',str(p),'-vf',vf,'-frames:v',str(frames),'-an','-c:v','libx264','-preset','veryfast','-crf','21','-threads','2',str(target)],check=True)
        parts.append(target)
    listing=OUT/'parts.txt'; listing.write_text(''.join("file '"+str(p)+"'\n" for p in parts))
    subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-i',str(ROOT/'public/vo.mp3'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',str(OUT/'ingatan-bisa-salah.mp4')],check=True)
if __name__=='__main__': run()
