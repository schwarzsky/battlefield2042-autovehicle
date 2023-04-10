from python_imagesearch.imagesearch import imagesearch
import sys
from os import path

workpath = path.expandvars(r'%LOCALAPPDATA%\Programs\battlefield-2042-autovehicle\resources\lib\button.png')
pos = imagesearch(workpath)

if pos[0] != -1:
  print(pos[0], ",", pos[1])
else:
  print("NOT_FOUND")