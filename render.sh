#!/usr/bin/env bash
set -euo pipefail
visual=${1:?}
voice=${2:?}
output=${3:?}
font=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
mono=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
serif=/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf
length=$(${FFMPEG:-ffmpeg} -hide_banner -i "$voice" -vn -f null - 2>&1 | awk '/Duration:/ {split($2,a,":"); sub(/,$/,"",a[3]); print a[1]*3600+a[2]*60+a[3]}')
[[ -n "$length" ]]
${FFMPEG:-ffmpeg} -nostdin -hide_banner -loglevel error -y -threads 4 -i "$visual" -i "$voice" -filter_complex_threads 3 -filter_complex "[0:v]fps=90,scale=1232:2190:flags=bicubic,tpad=stop_mode=clone:stop_duration=1,pad=1440:2560:104:224:color=0x101716,drawbox=x=98:y=218:w=1244:h=2202:color=0xB79A61:t=3,drawbox=x=104:y=69:w=41:h=4:color=0xDDB36D:t=fill,drawtext=fontfile=$mono:text='NAYSI   /   ATLAS UKUR':x=164:y=52:fontsize=34:fontcolor=0xDDB36D,drawtext=fontfile=$serif:text='Indonesia vs Amerika Serikat':x=102:y=104:fontsize=64:fontcolor=0xF2E8CF,drawtext=fontfile=$mono:text='01   /   GEOGRAFI':x=104:y=2445:fontsize=28:fontcolor=0xDDB36D,drawtext=fontfile=$font:text='PROYEKSI  •  SKALA  •  JARAK':x=1336-tw:y=2445:fontsize=26:fontcolor=0xF2E8CF,drawbox=x=104:y=2504:w=1232:h=4:color=0x455551:t=fill,drawtext=fontfile=$font:text='■':x=104+1198*min(t/$length\,1):y=2487:fontsize=30:fontcolor=0xDDB36D,setsar=1[v]" -map '[v]' -map 1:a:0 -c:v libx264 -threads 5 -preset ultrafast -crf 23 -maxrate 8100k -bufsize 8100k -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -shortest -movflags +faststart "$output"
