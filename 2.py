# A-star for Grid Based Path Finding
"""
Evaulation Fn:- f(n)=g(n)+h(n)
* `g(n)` → cost from start to current node
* `h(n)` → heuristic (estimated cost to goal)

### 2. Heuristic (we use Manhattan Distance)
h(n) = |x_1 - x_2| + |y_1 - y_2|
"""

import heapq
# Heuristic: Manhattan Distance
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star(grid, start, goal):
    rows, cols = len(grid), len(grid[0])

    # Priority Queue: (f, g, node)
    open_list = []
    heapq.heappush(open_list, (0, 0, start))

    seen = {}
    g_cost = {start: 0}

    visited = set()

    while open_list:
        f, g, current = heapq.heappop(open_list)

        if current in visited:
            continue

        visited.add(current)

        # Goal reached
        if current == goal:
            path = []
            while current in seen:
                path.append(current)
                current = seen[current]
            path.append(start)
            return path[::-1]

        x, y = current

        # 4-direction movement
        neighbors = [(x+1,y), (x-1,y), (x,y+1), (x,y-1)]

        for nx, ny in neighbors:
            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == 0:
                new_g = g + 1

                if (nx, ny) not in g_cost or new_g < g_cost[(nx, ny)]:
                    g_cost[(nx, ny)] = new_g
                    f_cost = new_g + heuristic((nx, ny), goal)

                    heapq.heappush(open_list, (f_cost, new_g, (nx, ny)))
                    seen[(nx, ny)] = current

    return None


if __name__ == "__main__":
    grid = [
        [0, 0, 0, 0],
        [1, 1, 0, 1],
        [0, 0, 0, 0],
        [0, 1, 1, 0]
    ]
    start = (0, 0)
    goal = (3, 3)
    path = a_star(grid, start, goal)
    if path:
        print("Path found:\n", path)
    else:
        print("No path exists")
