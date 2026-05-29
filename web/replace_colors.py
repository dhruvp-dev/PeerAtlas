import os
import re

dir_path = "/home/dhruv_user/My_Cooking/Peeratlas/web/src"

replacements = {
    r"text-navy-deep": "text-foreground",
    r"text-navy-mid(/\d+)?": "text-muted-foreground",
    r"bg-white": "bg-card",
    r"bg-mist(/\d+)?": "bg-muted",
    r"text-sky-blue(/\d+)?": "text-primary",
    r"bg-sky-tint": "bg-accent",
    r"hover:text-navy-deep": "hover:text-foreground",
    r"hover:border-sky-blue": "hover:border-primary",
}

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".tsx"):
            file_path = os.path.join(root, file)
            with open(file_path, "r") as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(file_path, "w") as f:
                    f.write(new_content)
                print(f"Updated {file_path}")
