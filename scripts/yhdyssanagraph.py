import pandas as pd
import fastparquet

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



