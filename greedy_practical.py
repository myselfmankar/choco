"""
Greedy Algorithms Practical

1. Selection Sort
Problem Statement: Sort a list of numbers in ascending order using the selection sort algorithm.
Application: Used for small datasets or when memory writes are costly. Simple and easy to implement.

2. Kruskal's Algorithm (MST)
Problem Statement: Given a connected, undirected, weighted graph, find a subset of edges that connects all vertices with the minimum total edge weight and no cycles.
Application: Used in designing least-cost network layouts (e.g., electrical grids, computer networks).

3. Dijkstra's Algorithm (Shortest Path)
Problem Statement: Given a weighted graph and a source vertex, find the shortest path from the source to all other vertices.
Application: Used in GPS navigation, network routing, and mapping applications.
"""

# 1. Selection Sort
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

# 2. Kruskal's Algorithm (MST)
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        self.parent[py] = px
        return True

def kruskal(n, edges):
    uf = UnionFind(n)
    mst = []
    edges.sort(key=lambda x: x[2])
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
        else:
            print(f"Skipping edge ({u}, {v}) with weight {w} to avoid cycle.")
    return mst

# 3. Dijkstra's Algorithm (Shortest Path)
import heapq
def dijkstra(graph, start):
    dist = [float('inf')] * len(graph)
    prev = [None] * len(graph)
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nei, weight in graph[node]:
            newDist = d + weight
            if newDist < dist[nei]:
                dist[nei] = newDist
                prev[nei] = node
                heapq.heappush(heap, (newDist, nei))
    return dist, prev

def print_path(prev, target):
    path = []
    while target is not None:
        path.append(target)
        target = prev[target]
    print(" -> ".join(map(str, path[::-1])))

graph = {
    0: [(1,4), (2,1)],
    1: [(3,1)],
    2: [(1,2), (3,5)],
    3: []
}

print(dijkstra(graph, 0))

if __name__ == "__main__":
    # Test Selection Sort
    arr = [64, 25, 12, 22, 11]
    print("Selection Sort:")
    print("Original:", arr)
    print("Sorted:", selection_sort(arr[:]))
    print()

    # Test Kruskal's Algorithm
    edges = [
        (0, 1, 10), (0, 2, 6), (0, 3, 5),
        (1, 3, 15), (2, 3, 4)
    ]
    print("Kruskal's MST:")
    mst = kruskal(4, edges)
    print("Edges in MST:", mst)
    print()

    edges_cycle = [
        (0, 1, 1),(1, 2, 2), (2, 0, 3)
    ]
    print("Kruskal's MST with Cycle Detection:")
    mst_cycle = kruskal(3, edges_cycle)
    print("Edges in MST:", mst_cycle)
    print()

    # Test Dijkstra's Algorithm
    graph = [
        [(1, 2), (2, 4)],    # 0
        [(2, 1), (3, 7)],    # 1
        [(3, 3)],                  # 2 (we can remove (3, 3) to make 3 unreachable)
        []                   # 3
    ]
    print("Dijkstra's Shortest Path:")
    dist, prev = dijkstra(graph, 0)
    print("Distances from source 0:", dist)
    print("Path to 3:", end=" ")
    print_path(prev, 3)
    
    unreachable_graph = [
        [(1, 1)],    # Node 0 connects to 1
        [(2, 1)],    # Node 1 connects to 2
        [],          # Node 2 has no outgoing edges
        [(4, 1)],    # Node 3 connects to 4 (isolated from 0, 1, 2)
        []           # Node 4 has no outgoing edges
    ]
    print("Dijkstra's Shortest Path on Unreachable Graph:")
    dist, prev = dijkstra(unreachable_graph, 0)
    print("Distances from source 0:", dist)
    print("Path to 4:", end=" ")
    print_path(prev, 4)