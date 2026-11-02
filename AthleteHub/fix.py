import os, glob
import re

for root, _, files in os.walk('c:/Users/Sai Ram/OneDrive/Documents/Athlete-hub/frontend/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            # Fix Pagination
            new_content = re.sub(r'import Pagination from [\'"].*?components/ui/Pagination[\'"];', r'import Pagination from "../../components/ui/LegacyPagination";', new_content)
            
            # Fix Badge (if any)
            new_content = re.sub(r'import Badge from [\'"].*?components/ui/Badge[\'"];', r'import { Badge } from "@/components/ui/badge";', new_content)
            
            # Fix Avatar (if any left)
            new_content = re.sub(r'import Avatar from [\'"].*?components/ui/Avatar[\'"];', r'import { Avatar } from "@/components/ui/avatar";', new_content)
            
            # Fix Card
            new_content = re.sub(r'import {? ?Card ?}? from [\'"].*?components/ui/Card[\'"];', r'import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";', new_content)

            # Fix Button
            new_content = re.sub(r'import Button from [\'"].*?components/ui/Button[\'"];', r'import { Button } from "@/components/ui/button";', new_content)
            
            # Fix Input
            new_content = re.sub(r'import Input from [\'"].*?components/ui/Input[\'"];', r'import { Input } from "@/components/ui/input";', new_content)

            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')
