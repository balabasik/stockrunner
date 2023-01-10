import json
import struct

days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

# TODO:
# weekends

def cumu():
    x = [0]
    for i in range(len(days)):
        x.append(x[-1] + days[i])
    return x

cumuDays = cumu()

def toDay(t):
    # t = 1/31/22
    # ret 0 based day of the year
    m, d, y = t.split("/")
    if y != "22":
        return -1
    return cumuDays[int(m)-1] + int(d) - 1


with open("data.json") as f:
  j = json.load(f)

names = list(j.keys())

nums = []
n = 365

for name in names:
    data = j[name]
    res = [-1] * n
    minn = None
    maxx = None
    for _, value in data.items():
        if minn is None or value < minn:
            minn = value
        if maxx is None or value > maxx:
            maxx = value

    for t, value in data.items():
        day = toDay(t)
        if day>=0 and day<365:
            res[day] = int(100 * (value - minn) / (maxx - minn))

    nums += res

with open("names.json", "w") as f:
    json.dump(names,f)

with open("nums.json", "w") as f:
    json.dump(nums,f)

buffer = bytearray()
for k in nums:
    buffer += struct.pack('b',k)


with open("nums.bin", "wb") as f:
    f.write(buffer)
