CS 121: Schelling's Model of Housing Segregation

The grid file format is simple. The first line contains the grid
size. Each subsequent line contains information for a single row,
starting with row 0. An "M" means that the corresponding location has a maroon
homeowner, a "B" means that the corresponding location has a blue
homeowner, and an "O" means that the location is open.

a19-sample-writeup.txt: example from the writeup.

grid-sea-of-red.txt: A grid in which all the homes are
occupied by maroon homeowners, except two open homes and two homes
occupied by blue homeowners.

grid-no-neighbors.txt: a sparsely populated grid

a19-sample-grid.txt: A 5x5 grid used in a number of tests

grid-ties.txt: a 6x6 grid used in a number of tests.

grid-ten.txt: a 10x10 grid used in a number of tests.

large-grid.txt: a 40x40 grid used to test whether a solution is too inefficient

The files with a "-final.txt" extension represent the final state
of a test. See the writeup for the list of what tests
these correspond to.