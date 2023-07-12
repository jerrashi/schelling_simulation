# CS121: Schelling Model of Housing Segregation
# 
# Test code for do_simulation
#

import os
import sys

timeout=60

# Handle the fact that the grading code may not
# be in the same directory as schelling.py
sys.path.insert(0, os.getcwd())

# Get the test files from the same directory as
# this file.
BASE_DIR = os.path.dirname(__file__)


from schelling import do_simulation
import pytest
import utility

def count_homeowners(grid):
    '''
    Count the number of occupied homes:

    Inputs:
        grid: (list of lists of strings) the grid

    Returns: integer
    '''

    num_homeowners = 0
    for row in grid:
        for home in row:
            if home != "O":
                num_homeowners += 1
    return num_homeowners


def helper(input_filename, expected_filename, R, simil_threshold, occup_threshold,
           max_num_steps, expected_num_relocations):
    '''
    Do one simulation with the specified parameters (R, threshold,
    max_num_steps) starting from the specified input file.  Match
    actual grid generated with the expected grid and match expected
    steps and actual steps.

    Inputs:
        input_filename: (string) name of the input grid file
        expected_filename: (string) name of the expected grid file.
        R: (int) radius for the neighborhood
        simil_threshold: lower bound for similarity score
        occup_threshold: lower bound for occupancy score
        max_steps: (int) maximum number of steps to do
        expected_num_relocations: (int) expected number of relocations
            performed during the simulation
    '''

    input_filename = os.path.join(BASE_DIR, input_filename)
    actual_grid = utility.read_grid(input_filename)
    expected_num_homeowners = count_homeowners(actual_grid)
    opens = utility.find_opens(actual_grid)

    actual_num_relocations = do_simulation(actual_grid, R, simil_threshold,
                                           occup_threshold, max_num_steps, opens)
    actual_num_homeowners = count_homeowners(actual_grid)

    expected_filename = os.path.join(BASE_DIR, expected_filename)
    expected_grid = utility.read_grid(expected_filename)

    if actual_num_relocations != expected_num_relocations:
        s = ("actual and expected number of relocations do not match\n"
             "  got {:d}, expected {:d}")
        s = s.format(actual_num_relocations, expected_num_relocations)
        pytest.fail(s)

    if actual_num_homeowners != expected_num_homeowners:
        if actual_num_homeowners <= expected_num_homeowners:
            s = "Homeowners are fleeing the city!\n"
        else:
            s = "The city is gaining homeowners.\n"            
        s = s + "  Actual number of homeowners: {:d}\n".format(actual_num_homeowners)
        s = s + "  Expected number of homeowners: {:d}\n".format(expected_num_homeowners)
        pytest.fail(s)
        
    mismatch = utility.find_mismatch(actual_grid, expected_grid)
    if mismatch:
        (i, j) = mismatch
        s = "actual and expected grid values do not match at location ({:d}, {:d})\n"
        s = s.format(i, j)
        s = s + "  got {}, expected {}".format(actual_grid[i][j], expected_grid[i][j])
        pytest.fail(s)


def test_0():
    # Check example from writeup after 1 simulation step
    input_fn = "tests/a19-sample-writeup.txt"
    output_fn = "tests/a19-sample-writeup-1-44-50-1-final.txt"
    helper(input_fn, output_fn, 1, 0.44, 0.5, 1, 5)

def test_1():
    # Check example from writeup after 2 simulation steps
    input_fn = "tests/a19-sample-writeup.txt"
    output_fn = "tests/a19-sample-writeup-1-44-50-2-final.txt"
    helper(input_fn, output_fn, 1, 0.44, 0.5, 2, 8)

def test_2():
    # Check example from writeup after 3 simulation steps
    input_fn = "tests/a19-sample-writeup.txt"
    output_fn = "tests/a19-sample-writeup-1-44-50-3-final.txt"
    helper(input_fn, output_fn, 1, 0.44, 0.5, 3, 9)

def test_3():
    # Check example from writeup with larger R
    input_fn = "tests/a19-sample-writeup.txt"
    output_fn = "tests/a19-sample-writeup-2-60-70-2-final.txt"
    helper(input_fn, output_fn, 2, 0.6, 0.7, 2, 2)

def test_4():
    # Check stopping condition #1
    input_fn = "tests/a19-sample-grid.txt"
    output_fn = "tests/a19-sample-grid-1-44-50-0-final.txt"
    helper(input_fn, output_fn, 1, 0.44, 0.5, 0, 0)

def test_5():
    # Check stopping condition #2
    input_fn = "tests/a19-sample-grid.txt"
    output_fn = "tests/a19-sample-grid-1-20-50-10000000-final.txt"
    helper(input_fn, output_fn, 1, 0.2, 0.5, 10000000, 2)

def test_6():
    # Check 'only one satisfactory home' relocation exception (happens in Step 2)
    input_fn = "tests/a19-sample-grid.txt"
    output_fn = "tests/a19-sample-grid-1-70-50-2-final.txt"
    helper(input_fn, output_fn, 1, 0.7, 0.5, 2, 7)

def test_7():
    # Check choosing among locations with same distance (happens in first relocation)
    input_fn = "tests/grid-ties.txt"
    output_fn = "tests/grid-ties-1-40-50-2-final.txt"
    helper(input_fn, output_fn, 1, 0.4, 0.5, 2, 3)

def test_8():
    # Check case where there are no suitable homes.
    input_fn = "tests/grid-sea-of-red.txt"
    output_fn = "tests/grid-sea-of-red-1-40-70-1-final.txt"
    helper(input_fn, output_fn, 1, 0.4, 0.7, 1, 0)

def test_9():
    # Medium-size grid.
    input_fn = "tests/grid-ten.txt"
    output_fn = "tests/grid-ten-2-70-40-4-final.txt"
    helper(input_fn, output_fn, 2, 0.7, 0.4, 4, 63)

def test_10():
    # Check a larger R.
    input_fn = "tests/grid-ten.txt"
    output_fn = "tests/grid-ten-3-70-40-2-final.txt"
    helper(input_fn, output_fn, 3, 0.7, 0.4, 2, 8)

@pytest.mark.large
def test_11():
    # Large grid
    input_fn = "tests/large-grid.txt"
    output_fn = "tests/large-grid-2-74-41-20-final.txt"
    helper(input_fn, output_fn, 2, 0.74, 0.41, 20, 1072)

