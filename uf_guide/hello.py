
x = [-1, -1/2, 0, 1/2, 1]
y = [-1, -1/8, 0, 1/8, 1]
w = 0.75
b = 0
sum = 0

for i in range(5):
    sum += pow((y[i]-w*x[i]-b),2)

print(w)
print(sum)
