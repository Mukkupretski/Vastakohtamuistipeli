import pandas as pd
import fastparquet

# read or write

with open('./output/wiktionary-yhdyssanat', 'r') as f:
    for line in f:
        yhdyssana = line.rstrip().split(',')
        # If yhdyssana and first part start with different letter, it is probably bad
        # remove stuff such as talous + alue = erikoistalousalue
        if yhdyssana[0][0] != yhdyssana[2][0]:
            continue
        wiktionary.append(yhdyssana)

print(wiktionary)
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
len(wiktionary_edges)


l=[219, 308, 1200, 1313, 234]
l=[222, 1183, 1773, 369, 1301]
l=[

666, 138, 678, 111, 48, 116
]

for i in range(len(l)):
    print(wiktionary_compounds[(l[i],l[(i+1)%len(l)])])



# cyclefind naive - no duplicates by just taking unique minimum
def construct_mapgraph(graph):
    res = dict()
    for edge in graph:
        if edge[0] not in res:
            res[edge[0]] = []
        res[edge[0]].append(edge[1])
    return res
def dfs(graph, lim, curr, visited, res, i):
    if(i > lim-1):
        return
    start = curr[0]
    node = curr[-1]
    if not node in graph:
        return
    for neigh in graph[node]:
        # every cycle starts from minimum so no duplicates
        if neigh < start:
            continue
        if neigh == start:
            res.append(curr.copy())
            continue
        if neigh in visited:
            continue
        curr.append(neigh)
        visited.add(neigh)
        dfs(graph,lim,curr,visited,res,i+1)
        curr.pop()
        visited.remove(neigh)

def find_cycles(graph, lim):
    mapgraph = construct_mapgraph(graph)
    res = []
    for i in mapgraph.keys():
        visited = set()
        curr = [i]
        dfs(mapgraph, lim,curr,visited,res,0)
    return res

cycles = find_cycles(smallgraph, 16)

# print cycles !!df on sekaisin ATM
for cycle in cycles:
    print('\n')
    for i in cycle:
        print(compound(i,df) ,end=' ')




## hugging face dataset

# should have Compound Word, Word1 and Word2
df = pd.read_parquet("hf://datasets/nessa01macias/compound-words-finnish/data/train-00000-of-00001.parquet")
df = df.drop_duplicates()

df.isna().sum()
df.info()

# To csv
df['Compound Word'].to_csv('output/data.csv', index=True)

# generate graph
graph = []

for i, rowi in df.iterrows():
    for j, rowj in df.iterrows():
        # link to word with same start as current end
        if rowi['Word2'] == rowj['Word1']:
            graph.append([i,j])

# read
with open('output/graph.txt', 'r', encoding='utf-8') as f:
    graph = [[int(line.split(" ")[0]),int(line.split(" ")[1])] for line in f.readlines()] 
len(graph)
for i in range(200, 225):
    print(compound(graph[i][0],df),compound(graph[i][1],df))



# write
with open('output/graph.txt', 'w', encoding='utf-8') as f:
    for elem in graph:
        f.write(f"{elem[0]} {elem[1]}\n")


# remove orphans
indeg = set()
outdeg = set()
for edge in graph:
    indeg.add(edge[1])
    outdeg.add(edge[0])
useful = indeg & outdeg
smallgraph = [edge for edge in graph if (edge[0] in useful and edge[1] in useful)]
smallgraph
len(smallgraph)

# write without orphans
with open('output/smallgraph.txt', 'w', encoding='utf-8') as f:
    for elem in smallgraph:
        f.write(f"{elem[0]} {elem[1]}\n")

# read small
with open('output/smallgraph.txt', 'r', encoding='utf-8') as f:
    smallgraph = [[int(line.split(" ")[0]),int(line.split(" ")[1])] for line in f.readlines()] 
smallgraph

# print stuff
def compound(i,data):
    return data.loc[i]["Compound Word"]
for i in range(20):
    print(compound(smallgraph[i][0]), compound(smallgraph[i][1]))
