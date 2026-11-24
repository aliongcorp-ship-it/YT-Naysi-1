"""Zip the four packaging fields next to the master so it is one transfer.

Input   out/naysi_pack.json
Output  out/naysi_pack.zip  (JUDUL.txt, DESKRIPSI.txt, HASHTAG.txt, TAG.txt)
"""
import json
import zipfile

pack = json.load(open("out/naysi_pack.json"))

with zipfile.ZipFile("out/naysi_pack.zip", "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("JUDUL.txt", pack["title"] + "\n")
    z.writestr("DESKRIPSI.txt", pack["description"] + "\n")
    z.writestr("HASHTAG.txt", " ".join(pack["hashtags"]) + "\n")
    z.writestr("TAG.txt", ", ".join(pack["tags"]) + "\n")

print("out/naysi_pack.zip")
for name, body in (
    ("JUDUL", pack["title"]),
    ("DESKRIPSI", pack["description"]),
    ("HASHTAG", " ".join(pack["hashtags"])),
    ("TAG", ", ".join(pack["tags"])),
):
    print(f"  {name:<9} {len(body)} chars")
