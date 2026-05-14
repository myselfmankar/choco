# bfs-dfs for file / dir traversal 
import os
def dfs(path, i):
    if not os.path.exists(path):
        return
    print("- " * i + os.path.basename(path))
    if os.path.isdir(path):
        for item in os.listdir(path):
            dfs(os.path.join(path, item), i + 1)

from collections import deque
def bfs(path):
    if not os.path.exists(path):
        return
    q = deque([(path, 0)])
    while q:
        p, i = q.popleft()
        print("- " * i + os.path.basename(p))
        if os.path.isdir(p):
            for item in os.listdir(p):
                q.append((os.path.join(p, item), i + 1))


# N-queen 
def n_queen(n):
    board = [["."] * n for _ in range(n)]
    res = []
    cols, dia1, dia2 = set(), set(), set()
    def backtrack(row):
        if row == n:
            res.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row + col) in dia1 or (row - col) in dia2:
                continue
                
            cols.add(col)
            dia1.add(row + col)
            dia2.add(row - col)
            board[row][col] = "Q"
            backtrack(row + 1)
            cols.remove(col)
            dia1.remove(row + col)
            dia2.remove(row - col)
            board[row][col] = "."
        
    backtrack(0)
    return res

res = n_queen(4)
for b in res:
    for r in b:
        print(r)
    print()

# greedy questions - selection, kruskal, dijkstra 
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_i = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_i]: min_i = j
        arr[i], arr[min_i] = arr[min_i], arr[i]
    return arr

class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
            x = self.parent[x]
        return x
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        self.parent[px] = py
        return True

def kruskal(n, edges):
    uf = UnionFind(n)
    edges.sort(key = lambda x: x[2])
    mst = []
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
    return mst


def dijikstra(graph, start):
    import heapq
    dist = [float('inf')] * len(graph)
    dist[start] = 0
    prev = [None] * len(graph)
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nei, w in graph[node]:
            nd = d + w
            if nd < dist[nei]:
                dist[nei] = nd
                prev[nei] = node
                heapq.heappush(heap, (nd, nei))
    return dist, prev

def print_path(prev, tar):
    path = []
    while tar is not None:
        path.append(tar)
        tar = prev[tar]
    print("->".join(map(str, res[::-1])))
    

import heapq
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_start(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    open_list = [(heuristic(start, goal), 0, start)]
    g_cost = {start: 0}
    parent = {}
    visit = set()
    dirr = [(1,0), (-1,0), (0,1), (0,-1)]
    while open_list:
        _, cost, (x, y) = heapq.heappop(open_list)
        if (x, y) in visit:
            continue
        visit.add((x, y))
        if (x, y) == goal:
            path = []
            while (x, y) in parent:
                path.append((x, y))
                x, y = parent[(x, y)]
            path.append(start)
            return path[::-1], cost
        for dx, dy in dirr:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 0:
                new_cost = cost + 1
                if new_cost < g_cost.get((nx, ny), float('inf')):
                    g_cost[(nx, ny)] = new_cost
                    f_cost = new_cost + heuristic((nx, ny), goal)
                    heapq.heappush(open_list, (f_cost, new_cost, (nx, ny)))
                    parent[(nx, ny)] = (x, y)
    return None, 0
