import random
# wiktionary dataset

def compactify(edges):
    indeg = set()
    outdeg = set()
    for edge in edges:
        indeg.add(edge[1])
        outdeg.add(edge[0])
    useful = indeg & outdeg
    smallgraph = [edge for edge in edges if (edge[0] in useful and edge[1] in useful)]
    return smallgraph

wiktionary = [] # [word1, word2, compound][]
wiktionary_edges = []
wiktionary_graph = dict()
wiktionary_units = []
wiktionary_indexes = dict()
wiktionary_compounds = dict()

with open('./output/wiktionary-yhdyssanat', 'r') as f:
    for line in f:
        yhdyssana = line.rstrip().split(',')
        # If yhdyssana and first part start with different letter, it is probably bad
        # remove stuff such as talous + alue = erikoistalousalue
        if yhdyssana[0][0] != yhdyssana[2][0]:
            continue
        wiktionary.append(yhdyssana)

for compound in wiktionary:
    w1 = compound[0]
    w2 = compound[1]
    if w1 not in wiktionary_indexes:
        ind = len(wiktionary_units)
        wiktionary_indexes[w1] = ind
        wiktionary_units.append(w1)
    if w2 not in wiktionary_indexes:
        ind = len(wiktionary_units)
        wiktionary_indexes[w2] = ind
        wiktionary_units.append(w2)
    i1 = wiktionary_indexes[w1]
    i2 = wiktionary_indexes[w2]
    wiktionary_edges.append([i1,i2])
    wiktionary_graph[i1] = []
    wiktionary_compounds[(i1,i2)] = compound[2]

prev = len(wiktionary_edges)
while True:
    wiktionary_edges = compactify(wiktionary_edges)
    if len(wiktionary_edges) == prev:
        break
    prev = len(wiktionary_edges) 

for edge in wiktionary_edges:
    wiktionary_graph[edge[0]].append(edge[1])

ls = []
total = 0
searchlim = 100000
src = 0
lower = 4
upper = 12
totalsum = 1500
samelim = 500
perRoot = 20
currRoot = 0
for i in range(upper+1):
    ls.append([])

# cyclefind naive - no duplicates by just taking unique minimum
# def dfs(graph, lim, curr, visited, res, i):
#     if(i > lim-1):
#         return
#     start = curr[0]
#     node = curr[-1]
#     if not node in graph:
#         return
#     for neigh in graph[node]:
#         # every cycle starts from minimum so no duplicates
#         if neigh == start:
#             ln = len(curr)
#             if len(ls[ln]<1000):
#                 total += 1
#                 ls[ln].append(curr.copy())
#             print(total)
#             continue
#         if neigh in visited:
#             continue
#         curr.append(neigh)
#         visited.add(neigh)
#         dfs(graph,lim,curr,visited,res,i+1)
#         curr.pop()
#         visited.remove(neigh)
# quit on found
def dfs_quit(graph, lim, curr, visited, res, i):
    global total
    global searchlim
    global src
    global lower
    global upper
    global samelim
    global currRoot
    global perRoot
    if searchlim < src:
        return
    if perRoot < currRoot:
        return
    if(i > upper-1):
        return
    start = curr[0]
    node = curr[-1]
    if not node in graph:
        return 
    random.shuffle(graph[node])
    for neigh in graph[node]:
        src += 1
        if src > searchlim:
            break
        # every cycle starts from minimum so no duplicates
        if neigh == start:
            ln = len(curr)
            if ln < lower:
                continue
            if len(ls[ln])<samelim:
                total += 1
                currRoot += 1
                ls[ln].append(curr.copy())
            else:
                while len(ls[upper]) >= samelim:
                    upper -= 1
            print(total)
        if neigh in visited:
            continue
        curr.append(neigh)
        visited.add(neigh)
        dfs_quit(graph,lim,curr,visited,res,i+1)
        curr.pop()
        visited.remove(neigh)

# def find_cycles(graph, lim):
#     res = []
#     for i in graph.keys():
#         visited = set()
#         curr = [i]
#         dfs(graph, lim,curr,visited,res,0)
#         if total > 2000:
#             break
#     return res

def find_cycles(graph, lim):
    global src
    global totalsum
    global currRoot
    res = []
    ks = list(graph.keys())
    while upper >= lower:
        src = 0
        currRoot = 0
        i = random.choice(ks)
        visited = set()
        curr = [i]
        dfs_quit(graph, lim,curr,visited,res,0)
        # if total > totalsum:
        #     break
    return res
cycles = find_cycles(wiktionary_graph, upper)
for i in range(len(ls)):
    name = "output/" + str(i) + ".txt"
    with open(name, 'w') as f:
        for line in ls[i]:
            f.write(' '.join(map(str,line)))
            f.write('\n')
