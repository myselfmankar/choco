# bfs-dfs file dir traversal
import os
def _dfs(path, indent=0):
    try:
        if not os.path.exists(path):
            print("Path does not exist")
            return
        print("  " * indent + "|-- " + os.path.basename(path))
        if os.path.isdir(path):
            for item in os.listdir(path):
                full_path = os.path.join(path, item)
                _dfs(full_path, indent + 1)
    except PermissionError:
        print("  " * indent + "|-- [Permission Denied]")


from collections import deque
def _bfs(path):
    if not os.path.exists(path):
        print("Path does not exist")
        return
    queue = deque([(path, 0)])
    while queue:
        current, indent = queue.popleft()
        try:
            print("  " * indent + "|-- " + os.path.basename(current))
            if os.path.isdir(current):
                for item in os.listdir(current):
                    full_path = os.path.join(current, item)
                    queue.append((full_path, indent + 1))
        except PermissionError:
            print("  " * indent + "|-- [Permission Denied]")


if __name__ == "__main__":
    path = input("Enter the path to traverse: ")
    print("DFS Traversal:")
    _dfs(path)
    print("\nBFS Traversal:")
    _bfs(path)
