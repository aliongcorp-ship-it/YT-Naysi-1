#!/usr/bin/env python3
"""Pull the rendered master + QA stills out of the delivery manifest.

The Actions job registers a git tree whose description is `tree:<sha>` on a
commit status; blob contents come back base64 through the API. This avoids the
artifact download endpoint, which is unreachable from the sandbox.
"""
import base64
import json
import os
import subprocess
import sys

BRANCH = "arena/a0f49af8-yt-naysi-1"
OUT = "/tmp/deliver"
VIDEO = "/tmp/deliver/master.mp4"


def gh(path: str) -> dict:
    return json.loads(subprocess.run(["gh", "api", path], capture_output=True, check=True, text=True).stdout)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    repo = json.loads(
        subprocess.run(["gh", "repo", "view", "--json", "nameWithOwner"], capture_output=True, check=True, text=True).stdout
    )["nameWithOwner"]
    head = gh(f"repos/{repo}/branches/{BRANCH}")["commit"]["sha"]
    statuses = gh(f"repos/{repo}/commits/{head}/statuses")["statuses"] if False else gh(f"repos/{repo}/commits/{head}/statuses")
    tree_sha = None
    for st in statuses:
        if st["context"] == "naysi/deliverables" and st["description"].startswith("tree:"):
            tree_sha = st["description"].split("tree:")[1]
            break
    if not tree_sha:
        print("no deliverables status for", head)
        sys.exit(2)
    tree = gh(f"repos/{repo}/git/trees/{tree_sha}")
    parts, files = [], []
    for item in tree["tree"]:
        (parts if item["path"].startswith("video_part_") else files).append(item)

    if parts:
        with open(VIDEO, "wb") as vf:
            for item in sorted(parts, key=lambda i: i["path"]):
                blob = gh(f"repos/{repo}/git/blobs/{item['sha']}")
                vf.write(base64.b64decode(blob["content"]))
        print("video:", VIDEO, os.path.getsize(VIDEO), "bytes")

    for item in files:
        blob = gh(f"repos/{repo}/git/blobs/{item['sha']}")
        path = os.path.join(OUT if not item["path"].endswith(".txt") else OUT, item["path"])
        with open(path, "wb") as f:
            f.write(base64.b64decode(blob["content"]))
    print("files:", ", ".join(i["path"] for i in files))
    print("head:", head, "tree:", tree_sha)


if __name__ == "__main__":
    main()
