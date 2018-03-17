class TetrisGame {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		this.scaleFactor = 20;
		this.context.scale(this.scaleFactor, this.scaleFactor);

		this.blankRow = [];
		for (let bR = 0; bR < this.gameGridWidth; bR++) {
			blankRow.push(0);
		}


		this.pieceGrids = {
			I_BLOCK: [
				[
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0],
				],
				[
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 0],
				]
			],
			J_BLOCK: [
				[
					[0, 0, 0],
					[2, 2, 2],
					[0, 0, 2]
				],
				[
					[0, 2, 2],
					[0, 2, 0],
					[0, 2, 0]
				],
				[
					[2, 0, 0],
					[2, 2, 2],
					[0, 0, 0]
				],
				[
					[0, 2, 0],
					[0, 2, 0],
					[2, 2, 0]
				]
			],
			L_BLOCK: [
				[
					[0, 0, 0],
					[3, 3, 3],
					[3, 0, 0]
				],
				[
					[0, 3, 0],
					[0, 3, 0],
					[0, 3, 3]
				],
				[
					[0, 0, 3],
					[3, 3, 3],
					[0, 0, 0]
				],
				[
					[3, 3, 0],
					[0, 3, 0],
					[0, 3, 0]
				]
			],
			O_BLOCK: [
				[
					[4, 4],
					[4, 4]
				]
			],
			S_BLOCK: [
				[
					[0, 5, 5],
					[5, 5, 0],
					[0, 0, 0],
				],
				[
					[5, 0, 0],
					[5, 5, 0],
					[0, 5, 0]
				],
			],
			T_BLOCK: [
				[
					[6, 6, 6],
					[0, 6, 0],
					[0, 0, 0]
				],
				[
					[6, 0, 0],
					[6, 6, 0],
					[6, 0, 0]
				],
				[
					[0, 0, 0],
					[0, 6, 0],
					[6, 6, 6]
				],
				[
					[0, 0, 6],
					[0, 6, 6],
					[0, 0, 6]
				]
			],
			Z_BLOCK: [
				[
					[7, 7, 0],
					[0, 7, 7],
					[0, 0, 0]
				],
				[
					[0, 7, 0],
					[7, 7, 0],
					[7, 0, 0]
				]
			]
		};

		this.gameState = "menu";
		this.dropTimeInterval = 1000;
		this.gameGridWidth = 10;
		this.gameGridHeigth = 20;
		this.gameHighScore = parseInt(window.localStorage.getItem("highScore") || 0);

		this.lastTime = 0;

		this.blankRow = [];
		for (let bR = 0; bR < this.gameGridWidth; bR++) {
			this.blankRow.push(0);
		}

		this.nextPiece = this.pickRandomPiece();

		//Detect pressed keys
		document.addEventListener('keydown', this.onKeyPressGateway.bind(this));

		this.gameColors = {
			TRANSPARENT: 'rgba(0, 0, 0, 0)',
			I_BLOCK: 'cyan',
			J_BLOCK: 'blue',
			L_BLOCK: 'orange',
			O_BLOCK: 'yellow',
			S_BLOCK: 'green',
			T_BLOCK: 'purple',
			Z_BLOCK: 'red',
			BLACK: 'black',
			GRAY: 'gray',
			GRID_BACKGROUND: 'rgb(40, 40, 40)',
			DROP_TARGET: 'rgba(255, 255, 255, 0.1)'
		};
	}

	gameInit() {
		this.dropTimeInterval = 1000;
		this.gridSize = 1;
		this.snakeMoved = true;
		this.gameScore = 0;
		this.brokenLines = 0;

		this.getNewPiece();

		this.currentPieceStacked = true;

		this.gameGrid = this.createGameGrid(this.gameGridWidth, this.gameGridHeigth);

		this.loop();
	}

	pickRandomPiece() {
		//send same piece
		if (this.isSamePiece()) {
			return this.currentPiece.selected;
		}

		let keepChanging = true; //piece changing semaphore
		let newPiece = []; //temporary new piece 
		while (keepChanging) {
			switch (this.randomBetween(1, 6)) {
				case 1:
					newPiece = this.pieceGrids.I_BLOCK;
					break;
				case 2:
					newPiece = this.pieceGrids.J_BLOCK;
					break;
				case 3:
					newPiece = this.pieceGrids.L_BLOCK;
					break;
				case 4:
					newPiece = this.pieceGrids.O_BLOCK;
					break;
				case 5:
					newPiece = this.pieceGrids.S_BLOCK;
					break;
				case 6:
					newPiece = this.pieceGrids.T_BLOCK;
					break;
				case 7:
					newPiece = this.pieceGrids.Z_BLOCK;
					break;
			}

			if (this.currentPiece) {
				if (newPiece !== this.currentPiece.selected) {
					keepChanging = false;
				}
			} else {
				keepChanging = false;
			}
		}

		return newPiece;
	}

	createGameGrid(width, height) {
		let gameGrid = [];
		for (let rows = 0; rows < height; rows++) {
			let rowArray = [];
			for (let cells = 0; cells < width; cells++) {
				rowArray.push(0);
			}
			gameGrid.push(rowArray);
		}
		return gameGrid;
	}

	rotate() {
		if (this.currentPiece.selected.length > 1) {
			let nextIndex = this.currentPieceIndex;
			if (this.currentPieceIndex === this.currentPiece.selected.length - 1) {
				nextIndex = 0;
			} else {
				nextIndex++;
			}

			let nextPieceBefore = this.currentPiece.selected[nextIndex];
			rows: for (let row = 0; row < nextPieceBefore.length; row++) {
				cells: for (let cell = 0; cell < nextPieceBefore[row].length; cell++) {
					let relRow = this.currentPiecePosition.y + row;
					let relCell = this.currentPiecePosition.x + cell;

					//are you trying to rotate while you touching the ground? then reject
					if (
						relRow >= this.gameGridHeigth &&
						nextPieceBefore[row][cell] > 0
					) {
						return;
					}

					//are you in game grid borders and
					//one of current piece collides with any grid items? then reject
					if (
						(relRow >= 0 && relRow < this.gameGridHeigth) &&
						(relCell >= 0 && relCell < this.gameGridWidth)
					) {
						if (
							nextPieceBefore[row][cell] > 0 &&
							this.gameGrid[relRow][relCell] > 0
						) {
							return; //do not rotate it because it paritally collides with pieces
						}
					}
				}
			}

			this.currentPieceIndex = nextIndex;

			this.currentPiece.active = this.currentPiece.selected[this.currentPieceIndex];

			let l = this.getLeftSpaceOfActivePiece(); //get matrix gaps on left side of piece
			let r = this.getRightSpaceOfActivePiece(); //get matrix gaps on right side of piece

			//Is it collides with left wall on rotation ? move piece on 0
			if (this.currentPiecePosition.x + l < 0) {
				this.currentPiecePosition.x = 0;
			}

			//Is it collides with right wall on rotation ? move piece to left - right gap
			if (this.currentPiecePosition.x + this.currentPiece.active.length - r > this.gameGridWidth) {
				this.currentPiecePosition.x = this.gameGridWidth - r - this.currentPiece.active.length;
			}
		}
	}

	getLeftSpaceOfActivePiece() {
		let leftSpace = 0;

		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				//reverse cell and row for checking order in vertically
				if (this.currentPiece.active[cell][row] > 0) {
					break row;
				}
			}

			leftSpace = row + 1;
		}

		return leftSpace;
	}

	getRightSpaceOfActivePiece() {
		let rightSpace = 0;

		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			rightSpace = (this.currentPiece.active.length - 1) - row;
			cell: for (let cell = this.currentPiece.active[row].length - 1; cell >= 0; cell--) {
				//reverse cell and row for checking order in vertically
				if (this.currentPiece.active[cell][row] > 0) {
					break row;
				}
			}
		}

		return rightSpace;
	}

	getBottomSpaceOfActivePiece() {
		let bottomSpace = 0;

		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) {
					break row;
				}
			}
			bottomSpace = this.currentPiece.active.length - row;
		}

		return bottomSpace;
	}

	moveLeft() {
		//Check piece and grid. If the touches eachother then do not move
		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				let lYcheck = this.currentPiecePosition.y + row;
				let lXcheck = (this.currentPiecePosition.x + cell) - 1;

				if (
					lXcheck >= 0 &&
					lYcheck >= 0 &&
					this.currentPiece.active[row][cell] > 0 &&
					this.gameGrid[lYcheck][lXcheck] > 0
				) {
					return; //don't move and return function
				}
			}
		}

		//check left boundary
		let leftSpace = this.getLeftSpaceOfActivePiece();

		//Check for it is next to walls of game grid
		if (this.currentPiecePosition.x > 0 - leftSpace) {
			this.currentPiecePosition.x += -1;
		}
	}

	moveRight() {
		//Check piece and grid. If the touches eachother then do not move
		row: for (let row = 0; row < this.currentPiece.active.length; row++) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				let rYcheck = this.currentPiecePosition.y + row;
				let rXcheck = (this.currentPiecePosition.x + cell) + 1;

				if (
					rXcheck < this.gameGridWidth &&
					rYcheck > 0 &&
					this.currentPiece.active[row][cell] > 0 &&
					this.gameGrid[rYcheck][rXcheck] > 0
				) {
					return; //don't move and return function
				}
			}
		}

		//check right boundary
		let rightSpace = this.getRightSpaceOfActivePiece();

		//Check for it is next to walls of game grid
		if (this.currentPiecePosition.x < (this.gameGridWidth - this.currentPiece.active.length) + rightSpace) {
			this.currentPiecePosition.x += 1;
		}
	}

	reset() {
		//Initialize game and start over
		this.gameInit();
	}

	gameOver() {
		clearInterval(this.timer);
		this.gameState = "over";
	}

	startGame() {
		this.gameInit();
		clearInterval(this.timer);
		this.gameState = "game";
	}

	moveDown() {
		if (this.currentPiecePosition.y < 0 && this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.gameState = "over";
		} else if (this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.mergeCurrentPieceWithGrid();
			this.checkSweep();
			this.getNewPiece();
		} else {
			this.currentPiecePosition.y++;
		}
	}

	//Our game loop
	loop(time = 0) {
		const deltaTime = time - this.lastTime;

		switch (this.gameState) {
			case "menu":
				this.drawMenu();
				break;
			case "game":
				//update game status
				if (deltaTime > this.dropTimeInterval) {
					this.lastTime = time;
					this.moveDown();
				}

				//draw game content
				this.drawGame();
				break;
			case "over":
				this.drawOver();
				break;
		}

		window.requestAnimationFrame(this.loop.bind(this));
	}

	isCurrentPieceCollidesWithGridItemsOrGround() {
		row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
			cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {

				//check piece from bottom to top row
				let gRow = this.currentPiecePosition.y + row + 1;
				let gCell = this.currentPiecePosition.x + cell;
				if (gRow >= 0 && gRow < this.gameGridHeigth) {
					if (
						this.currentPiece.active[row][cell] > 0 &&
						this.gameGrid[gRow][gCell] > 0
					) {
						return true;
					}
				}

				//does it touches the ground
				if (
					this.currentPiecePosition.y + row - this.getBottomSpaceOfActivePiece() === this.gameGridHeigth - 1
				) {
					return true;
				}
			}
		}

		return false;
	}

	getNewPiece() {
		this.currentPieceIndex = 0;
		this.randomlySelectedPiece = this.nextPiece;
		this.currentPiece = {
			active: this.randomlySelectedPiece[this.currentPieceIndex],
			selected: this.randomlySelectedPiece
		};
		this.currentPiecePosition = {
			x: Math.round(this.gameGridWidth / 2 - this.currentPiece.active.length / 2),
			y: 0 - this.currentPiece.active.length + this.getBottomSpaceOfActivePiece() //start in out of screen
		};
		this.nextPiece = this.pickRandomPiece();
	}

	mergeCurrentPieceWithGrid() {
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) {
					if (
						this.currentPiecePosition.y + row >= 0 &&
						this.currentPiecePosition.y + row < this.gameGridHeigth
					) {
						this.gameGrid[this.currentPiecePosition.y + row][this.currentPiecePosition.x + cell] = this.currentPiece.active[row][cell];
					}
				}
			}
		}
	}

	selectColorForContent(selectionNumber) {
		switch (selectionNumber) {
			case 0:
				this.context.fillStyle = this.gameColors.TRANSPARENT;
				break;
			case 1:
				this.context.fillStyle = this.gameColors.I_BLOCK;
				break;
			case 2:
				this.context.fillStyle = this.gameColors.J_BLOCK;
				break;
			case 3:
				this.context.fillStyle = this.gameColors.L_BLOCK;
				break;
			case 4:
				this.context.fillStyle = this.gameColors.O_BLOCK;
				break;
			case 5:
				this.context.fillStyle = this.gameColors.S_BLOCK;
				break;
			case 6:
				this.context.fillStyle = this.gameColors.T_BLOCK;
				break;
			case 7:
				this.context.fillStyle = this.gameColors.Z_BLOCK;
				break;
			default:
				this.context.fillStyle = 'rgb(220, 220, 220)';
				break;
		}
	}

	checkSweep() {
		let removeIndices = [];
		//Check all rows and break if it is fully filled 
		rows: for (let row = 0; row < this.gameGrid.length; row++) {
			for (let cell = 0; cell < this.gameGrid[row].length; cell++) {
				if (this.gameGrid[row][cell] === 0) {
					continue rows; //Skip this line
				}
			}

			removeIndices.push(row);
		}

		if (removeIndices.length > 0) {
			//create new line

			//remove line from grid and add new blank to top
			removeIndices.forEach((v) => {
				this.gameGrid.splice(v, 1);
				this.gameGrid.unshift(this.blankRow.slice()); //slice used for getting copy of array without reference
			});

			this.increaseScore(removeIndices.length);
		}
	}

	dropPiece() {
		let targetPosition = this.detectDropTargetPosition();
		let diffMultiplier = targetPosition.y - this.currentPiecePosition.y;
		this.currentPiecePosition.y = targetPosition.y;

		this.addDropScore(diffMultiplier);

		if (this.currentPiecePosition.y < 0 && this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.gameState = "over";
		} else if (this.isCurrentPieceCollidesWithGridItemsOrGround()) {
			this.mergeCurrentPieceWithGrid();
			this.checkSweep();
			this.getNewPiece();
		}
	}

	addDropScore(diff) {
		this.gameScore += 10 * diff;
		this.checkHighScore();
	}

	detectDropTargetPosition() {
		let position = {
			x: this.currentPiecePosition.x,
			y: this.currentPiecePosition.y
		};

		let dropOne = true;

		dropper: while (dropOne) {
			row: for (let row = this.currentPiece.active.length - 1; row >= 0; row--) {
				cell: for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {

					//check piece from bottom to top row
					let gRow = position.y + row + 1;
					let gCell = position.x + cell;
					if (gRow >= 0 && gRow < this.gameGridHeigth) {
						if (
							this.currentPiece.active[row][cell] > 0 &&
							this.gameGrid[gRow][gCell] > 0
						) {
							dropOne = false;
							break dropper;
						}
					}

					//does it touches the ground
					if (
						position.y + row - this.getBottomSpaceOfActivePiece() === this.gameGridHeigth - 1
					) {
						dropOne = false;
						break dropper;
					}
				}
			}
			position.y++;
		}

		return position;
	}

	increaseScore(multiplier = 1) {
		this.brokenLines += multiplier;
		if (this.brokenLines % 30 === 0) {
			this.dropTimeInterval -= 50;
		}

		this.gameScore += (100 * multiplier) * multiplier;
		this.checkHighScore();
	}

	checkHighScore() {
		//Check and update high score
		if (this.gameScore >= this.gameHighScore) {
			this.gameHighScore = this.gameScore;
			window.localStorage.setItem("highScore", this.gameHighScore);
		}
	}

	drawMenu() {
		this.context.fillStyle = this.gameColors.BLACK;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = this.gameColors.GRAY;
		this.context.font = '4px "Lucida Console", Monaco, monospace';
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText(
			"VANILLA",
			10,
			3
		);

		this.context.fillText(
			"JS",
			10,
			7
		);

		this.context.fillText(
			"TETRIS",
			10,
			11
		);

		this.context.font = '1px "Lucida Console", Monaco, monospace';
		this.context.fillText(
			"Arrow keys for move",
			10,
			14
		);
		this.context.fillText(
			"Space key for instant drop",
			10,
			16
		);

		this.context.fillText(
			"Enter for Start Game",
			10,
			18
		);
	}

	//draw game to the screen
	drawGame() {
		//region draw background
		this.context.fillStyle = this.gameColors.BLACK;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		//endregion

		this.context.fillStyle = this.gameColors.GRAY;
		//region outer frame for pieces
		this.context.fillRect(
			10 * this.gridSize,
			0 * this.gridSize,
			this.gridSize,
			20 * this.gridSize
		);

		this.context.fillRect(
			11 * this.gridSize,
			7 * this.gridSize,
			9 * this.gridSize,
			this.gridSize
		);
		//endregion

		//region draw level of game
		this.context.font = '1px "Lucida Console", Monaco, monospace';
		this.context.textAlign = "left";
		this.context.textBaseline = "top";
		this.context.fillText(
			"LEVEL : " + (((1000 - this.dropTimeInterval) / 50) + 1),
			12,
			9
		);
		//endregion

		//region draw broken lines
		this.context.fillText(
			"LINES : " + this.brokenLines,
			12,
			11
		);
		//endregion

		//region draw game score
		this.context.fillText(
			"SCORE",
			12,
			13
		);

		this.context.fillText(
			this.gameScore,
			12,
			14
		);
		//endregion

		//region draw high score
		this.context.fillText(
			"HIGH SCORE",
			12,
			16
		);
		this.context.fillText(
			this.gameHighScore,
			12,
			17
		);
		//endregion

		this.drawNextPiecesArea();
		this.drawGridPieces();
		this.drawCurrentPiece();
		this.drawDropTarget();
	}

	drawNextPiecesArea() {
		this.context.font = '1px "Lucida Console", Monaco, monospace';
		this.context.textAlign = "left";
		this.context.textBaseline = "top";
		this.context.fillText(
			"NEXT",
			12,
			1
		);

		for (let row = 0; row < this.nextPiece[0].length; row++) {
			for (let cell = 0; cell < this.nextPiece[0][row].length; cell++) {
				this.selectColorForContent(this.nextPiece[0][row][cell]);
				this.context.fillRect(
					12 + cell,
					3 + row,
					1,
					1
				);
			}
		}
	}

	drawGridPieces() {
		//draw background
		this.context.fillStyle = this.gameColors.GRID_BACKGROUND;
		this.context.fillRect(0, 0, this.gameGridWidth, this.gameGridHeigth);

		//draw pieces
		for (let row = 0; row < this.gameGrid.length; row++) {
			for (let cell = 0; cell < this.gameGrid[row].length; cell++) {
				this.selectColorForContent(this.gameGrid[row][cell]);
				this.context.fillRect(
					cell,
					row,
					this.gridSize,
					this.gridSize
				);
			}
		}
	}

	drawCurrentPiece() {
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				this.selectColorForContent(this.currentPiece.active[row][cell]);
				if (this.currentPiece.active[row][cell] > 0) {
					this.context.fillRect(
						this.currentPiecePosition.x + cell,
						this.currentPiecePosition.y + row,
						this.gridSize,
						this.gridSize
					);
				}
			}
		}
	}

	drawDropTarget() {
		let position = this.detectDropTargetPosition();

		this.context.fillStyle = this.gameColors.DROP_TARGET;
		for (let row = 0; row < this.currentPiece.active.length; row++) {
			for (let cell = 0; cell < this.currentPiece.active[row].length; cell++) {
				if (this.currentPiece.active[row][cell] > 0) {
					this.context.fillRect(
						position.x + cell,
						position.y + row,
						this.gridSize,
						this.gridSize
					);
				}
			}
		}
	}

	drawOver() {
		this.context.fillStyle = this.gameColors.BLACK;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = this.gameColors.GRAY;
		this.context.font = '5px "Lucida Console", Monaco, monospace';
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText(
			"GAME",
			10,
			3
		);

		this.context.fillText(
			"OVER",
			10,
			9
		);

		this.context.font = '1px "Lucida Console", Monaco, monospace';
		this.context.fillText(
			"Score : " + this.gameScore,
			10,
			12
		);
		this.context.fillText(
			"Lines : " + this.brokenLines,
			10,
			13
		);
		this.context.fillText(
			"Level : " + (((1000 - this.dropTimeInterval) / 50) + 1),
			10,
			14
		);

		if (this.gameScore === this.gameHighScore) {
			this.context.fillText(
				"You reached high score!",
				10,
				17
			);
		}

		this.context.fillText(
			"Enter For Menu",
			10,
			19
		);
	}

	//key detection gateway for all screens
	onKeyPressGateway(e) {
		switch (this.gameState) {
			case "menu":
				this.readMenuKeys(e);
				break;

			case "game":
				this.readGameKeys(e);
				break;

			case "over":
				this.readOverKeys(e);
				break;
		}
	}

	readMenuKeys(e) {
		//Enter Key
		if (e.keyCode === 13) {
			this.startGame();
		}
	}

	readGameKeys(e) {
		//Left Arrow
		if (e.keyCode === 37) {
			this.moveLeft();
		}

		//Up Arrow
		else if (e.keyCode === 38) {
			this.rotate();
		}

		//Right Arrow
		else if (e.keyCode === 39) {
			this.moveRight();
		}

		//Down Arrow
		if (e.keyCode === 40) {
			this.moveDown();
		}

		//Spacebar
		if (e.keyCode === 32) {
			this.dropPiece();
		}
	}

	readOverKeys(e) {
		//Enter Key
		if (e.keyCode === 13) {
			this.gameState = "menu";
		}
	}

	randomBetween(min, max) {
		return Math.round(Math.random() * max + min);
	}

	isSamePiece() {
		if (this.randomBetween(0, 1000) % 50 === 0) {
			return true;
		}
		return false;
	}
}

document.addEventListener("DOMContentLoaded", event => {
	const game = new TetrisGame(document.getElementById('game'));
	game.gameInit();
});