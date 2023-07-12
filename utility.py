'''
Schelling Model of Housing Segregation Assignment

Utility code for managing grids.
'''

import csv
import os
import sys

ALLOWED_VALUES = ("B", "M", "O")

def check_row(N, row, i, allowed=ALLOWED_VALUES):
    '''
    Check the format of ith row.

    Inputs:
        N: (int) the expected length of the row
        row: (list of strings) a row from the file
        i: (int) the row's line number in the file

    '''
    if len(row) != N:
        print("Format error in line {}: row is wrong length".format(i))
        sys.exit(0)
    if set(row) - set(allowed) != set():
        return False

    return True

def read_grid(filename, allowed=ALLOWED_VALUES):
    '''
    Read a grid from a text file and return the corresponding
    in-memory representation.

    Inputs:
        filename: (string) the name of the grid file to read

    Returns: (list of list of strings) the grid contained in file f.
    '''

    if not os.path.isfile(filename):
        print("Bad file name:" + filename)
        sys.exit(0)

    with open(filename) as f:
        reader = csv.reader(f, delimiter=" ")
        grid = []
        i = 0
        for row in reader:
            if i == 0 and len(row) == 1:
                # old format with N in the file
                continue
            if i == 0:
                N = len(row)
            if not check_row(N, row, i, allowed):
                print(row)
                print(("Format error in line {}: row has "
                       + "entry other than {}").format(i, "/".join(allowed)))
                sys.exit(0)
            grid.append(row)
            i = i + 1

        if not grid:
            print("File is empty")
            sys.exit(0)

        return grid


def find_opens(grid):
    '''
    Find locations of the open locations (pairs) in the grid.

    Inputs:
        grid: the grid

    Returns a list with the open locations.
    '''

    grid_size = len(grid)
    open_locations = []

    for i in range(grid_size):
        for j in range(grid_size):
            if grid[i][j] == "O":
                open_locations.append((i, j))

    return open_locations


def is_grid(grid):
    '''
    Verify that grid is a list (length N) where each element is a list
    of length N.  For smaller grids, check that the rows contain the
    allowed values.

    Inputs:
        grid: (list of lists of strings)

    Returns: boolean

    '''
    max_small_grid = 20

    if not isinstance(grid, list):
        return False

    if not grid:
        return False

    N = len(grid)
    if N <= max_small_grid:
        # do full check for small grids
        for row in grid:
            if not isinstance(row, list) or len(row) != N:
                return False
            for home in row:
                if home not in ALLOWED_VALUES:
                    return False
    else:
        # do length check only for larger grids
        for row in grid:
            if not isinstance(row, list) or len(row) != N:
                return False

    return True


def print_grid(grid):
    '''
    Print a text representation of a grid.

    Inputs:
        grid: (list of lists of strings)
    '''
    print(len(grid))
    for row in grid:
        print(row)


def find_mismatch(grid0, grid1):
    '''
    Find the first location where two grids differ.

    Inputs:
        grid0, grid1: (lists of lists of strings) grids

    Returns: None if the grids are the same, a location (int, int), if the
    grids are not the same.
    '''

    assert is_grid(grid0) and is_grid(grid1), \
        "Grids are not lists of lists of strings."

    assert len(grid0) == len(grid1), \
        "Grids are not the same shape."

    assert len(grid0[0]) == len(grid1[0]), \
        "Grids are not the same shape."

    for i, row in enumerate(grid0):
        for j, val0 in enumerate(row):
            # strip unsatisfied indicator from values if necessary
            val0 = val0 if "U" not in val0 else val0[1]
            val1 = grid1[i][j] if "U" not in grid1[i][j] else grid1[i][j][1]
            if val0 != val1:
                return (i, j)
    return None
