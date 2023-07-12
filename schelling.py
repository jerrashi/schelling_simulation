'''
Schelling Model of Housing Segregation

Program for simulating a variant of Schelling's model of
housing segregation.  This program takes five parameters:

	filename -- name of a file containing a sample city grid

	R - The radius of the neighborhood: home at Location (i, j) is in
		the neighborhood of the home at Location (k,l)
		if k-R <= i <= k+R and l-R <= j <= l+R

	Similarity threshold - minimum acceptable threshold for ratio of the number
						   of similar neighbors to the number of occupied homes
						   in a neighborhood.

	Occupancy threshold - minimum acceptable threshold for ratio of the number
						  of occupied homes to the total number of homes
						  in a neighborhood.

	max_steps - the maximum number of passes to make over the city
				during a simulation.

Sample:
  python3 schelling.py --grid_file=tests/a19-sample-grid.txt --r=1 \
					   --simil_threshold=0.44 --occup_threshold=0.5 \
					   --max_steps=1
'''

import os
import sys
# import click
import utility

# DO NOT REMOVE THE COMMENT BELOW
#pylint: disable-msg=too-many-arguments

def is_satisfied(grid, R, location, simil_threshold, occup_threshold):
	'''
	This function determines whehter or not a resident at a given location is satisfied.
	The resident must have a similarity score higher than or equal to their threshold
	as well as an occupancy score higher than or equal to their threshold.

	Inputs
		grid: (list of lists of strings) the grid
		R: (int) radius for the neighborhood
		simil_threshold: (float) Similarity threshold
		occup_threshold: (float) Occupancy threshold
	
	Returns
		True is resident is satisfied, False if resident is not satisfied.
	'''

	assert utility.is_grid(grid)
	   
	assert grid[location[0]][location[1]] != 'O'

	resident = grid[location[0]][location[1]]

	if simil_score(grid, R, location) < simil_threshold:
		return False
	elif occupancy_score(grid, R, location) < occup_threshold:
		return False
	else:
		return True
	
def best_satisfactory_house(grid, location, R, simil_threshold, occup_threshold, opens):
	'''
	This function looks at a list of open houses and, if there are house(s) that fulfill
	a resident's requirements, it returns the best satisfactory house.

	Inputs
		grid: (list of lists of strings) the grid
		location: (tuple) row and column coordinates of a resident
	   	R: (int) radius for the neighborhood
	   	simil_threshold: (float) Similarity threshold
	   	occup_threshold: (float) Occupancy threshold
	   	opens: (list of tuples) a list of open locations
	Returns
		best_house: (tuple) position of the best house in the grid
		best_house_exists: (Boolean) True if a suitable house exists,  False  if not
	'''
	satisfactory_open_houses = []
	(i, j) = location
	original_value = grid[i][j]
	grid[i][j] = 'O'
	best_house_exists = False

	for open_location in opens:
		(open_row, open_col) = open_location
		grid[open_row][open_col] = original_value
		if is_satisfied(grid, R, (open_row, open_col), simil_threshold, occup_threshold):
			satisfactory_open_houses.append(open_location)
		grid[open_row][open_col] = 'O'

	if len(satisfactory_open_houses) > 1:
		minimum_distance = len(grid) * 2
		for open_house in satisfactory_open_houses:
			distance = find_distance(location, open_house)
			if distance < minimum_distance:
				minimum_distance = distance
				best_house = open_house
				best_house_exists = True
	
	grid[i][j] = original_value

	return (best_house, best_house_exists)

def advance_position(grid, location, R, simil_threshold, occup_threshold, opens):
	'''
	This function looks at a single resident and if there is a swap that fulfills all
	the resident's requirements,  it performs the swap.

	Inputs
		grid: (list of lists of strings) the grid
	   	R: (int) radius for the neighborhood
	   	simil_threshold: (float) Similarity threshold
	   	occup_threshold: (float) Occupancy threshold
	   	max_steps: (int) maximum number of steps to do
	   	opens: (list of tuples) a list of open locations
	Returns
		grid: (lists of lists of strings) the grid, possibly altered
		moved: (Boolean) True if a swap was performed,  False  if not
	'''
	
	moved = False

	(i, j) = location
	original_value = grid[i][j]
	if not is_satisfied(grid, R, location, simil_threshold, occup_threshold):
		if len(opens) > 1:
			(best_house, best_house_exists) = best_satisfactory_house(grid, location, R, simil_threshold, occup_threshold, opens)
			if best_house_exists:
				(move_to_row, move_to_col) = best_house
				grid[move_to_row][move_to_col] = original_value
				grid[i][j] = 'O'
				opens.append((i,j))
				opens.remove((move_to_row, move_to_col))
				moved =True
	return [grid, moved]

def do_simulation(grid, R, simil_threshold, occup_threshold, max_steps, opens):
  
	'''
	Do a full simulation.

	Inputs:
	   grid: (list of lists of strings) the grid
	   R: (int) radius for the neighborhood
	   simil_threshold: (float) Similarity threshold
	   occup_threshold: (float) Occupancy threshold
	   max_steps: (int) maximum number of steps to do
	   opens: (list of tuples) a list of open locations

	Returns:
	   The total number of relocations completed.
	'''
	
	num_relocations = 0
	
	for s in range(max_steps):
		step_relocations = 0
		for i in range(0,len(grid)):
			for j in range(0,len(grid)):
				if grid[i][j] != 'O':
					location = (i,j)
					[grid, moved] = advance_position(grid, location, R, simil_threshold, occup_threshold, opens)
					if moved is True:
						step_relocations += 1
		
		# End simulation early if no one moved in the last step
		if step_relocations == 0:
			break

		num_relocations += step_relocations

	return num_relocations

# Helper functions below:

def find_distance(location, opens):
	'''
	Finds distance between two locations

	Inputs
		location: (tuple) First location
		opens: (tuple) Second location, named opens because we iterate through
		distance between a location and a list of open locations

	Returns
		The Manhattan distance between two locations, as an int.
	'''
	distance = abs(location[0] - opens[0]) + abs(location[1] - opens[1])
	return distance

def find_bounds(grid, R, location):
	'''
	This function finds the row & column bounds of an R-sized neighborhood centered
	around a given location in a given grid.

	Inputs
		grid: (list of lists of strings) the grid
		R: (int) radius for the neighborhood
		location: (tuple) row and column coordinates of a resident

	Returns
		List of row_lower_bound, row_upper_bound, col_lower_bound, and col_upper_bound.
	'''
	(resident_row, resident_col) = location
	
	if resident_row - R < 0:
		row_lower_bound = 0
	else:
		row_lower_bound = resident_row - R #recall lower bound is inclusive

	if resident_row + R + 1 > len(grid):
		row_upper_bound = len(grid)
	else:
		row_upper_bound = resident_row + R + 1 #recall upper bound is exclusive


	if resident_col - R < 0:
		col_lower_bound = 0
	else:
		col_lower_bound = resident_col - R

	if resident_col + R + 1 > len(grid):
		col_upper_bound = len(grid)
	else:
		col_upper_bound = resident_col + R + 1

	return [row_lower_bound, row_upper_bound, col_lower_bound, col_upper_bound]

def simil_score(grid, R, location):
	'''
	This function calculates the similarity score for a resident at a given location.
	Similarity score is the number of neighbors who are the same type as the resident
	divided by the number of total neighbors (i.e. neighbors who aren't unoccupied).

	Inputs
		grid: grid represented as list of lists
		R: maximum radius of neighborhood
		location: tuple, representing row & column co-ordinates

	Returns
		Similarity score
	'''

	(resident_row, resident_col) = location

	resident = grid[resident_row][resident_col]

	[row_lower_bound, row_upper_bound, col_lower_bound, col_upper_bound] = find_bounds(grid, R, location)

	simil_counter = 0

	total_area = (row_upper_bound - row_lower_bound) * (col_upper_bound - col_lower_bound)

	for i in range(row_lower_bound, row_upper_bound):
		for j in range(col_lower_bound, col_upper_bound):
			if grid[i][j] == resident:
				simil_counter += 1

	simil_score = simil_counter/(occupancy_score(grid, R, location) * total_area)

	return simil_score

def occupancy_score(grid, R, location):
	'''
	This function calculates the occupancy score for a resident at a given location.
	Occupancy score is the number of occupied houses within neighborhood size R,
	divided by the total number of houses within neighborhood.

	Inputs
		grid: grid represented as list of lists
		R: maximum radius of neighborhood
		location: tuple, representing row & column co-ordinates

	Returns
		Occupancy score
	'''
	(resident_row, resident_col) = location

	resident = grid[resident_row][resident_col]

	[row_lower_bound, row_upper_bound, col_lower_bound, col_upper_bound] = find_bounds(grid, R, location)

	occup_counter = 0

	total_area = (row_upper_bound - row_lower_bound) * (col_upper_bound - col_lower_bound)

	for i in range(row_lower_bound, row_upper_bound):
		for j in range(col_lower_bound, col_upper_bound):
			if grid[i][j] != 'O':
				occup_counter += 1

	occupancy_score = occup_counter/ total_area
	
	return occupancy_score