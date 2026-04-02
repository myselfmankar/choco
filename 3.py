# Constraint Satisfaction Problem (N-Queens using Backtracking)
"""
N-Queens Problem:
Place N queens on an NxN chessboard such that no two queens threaten each other.
Conditions:
- No two queens in the same row
- No two queens in the same column
- No two queens on the same diagonal
"""
def solveNQueens(self, n: int) -> List[List[str]]:
        res = []
        board = [["."] * n for _ in range(n)]
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

"""
Graph Coloring
Assign colors to vertices of a graph such that no two adjacent vertices have the same color.
"""
def is_safe(node, color, graph, colors):
    for neighbor in range(len(graph)):
        if graph[node][neighbor] == 1 and colors[neighbor] == color:
            return False
    return True
def solve_graph_coloring(graph, m):
    n = len(graph)
    colors = [-1] * n
    def backtrack(node):
        # All nodes colored
        if node == n:
            return True
        for color in range(m):
            if is_safe(node, color, graph, colors):
                colors[node] = color
                if backtrack(node + 1):
                    return True
                # Backtrack
                colors[node] = -1
        return False
    if backtrack(0):
        return colors
    else:
        return None

if __name__ == "__main__":
    # Graph coloring
    graph = [
        [0, 1, 1, 1],
        [1, 0, 1, 0],
        [1, 1, 0, 1],
        [1, 0, 1, 0]
    ]
    m = 3
    colors = solve_graph_coloring(graph, m)
    if colors:
        print("Solution:", colors)
    else:
        print("No solution exists")
    
    # n-queens
    n = int(input("Enter the number of queens (N): "))
    solution = solve_n_queens(n)
    if solution:
        print("\nSolution:")
        print_solution(solution)
    else:
        print("No solution exists")
