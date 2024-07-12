class CandidateNode {
    constructor(digit, row, col) {
        this.digit = digit;
        this.row = row;
        this.col = col;
    }
}

class Node {
    constructor(candidateNode = null) {
        this.left = this;
        this.right = this;
        this.up = this;
        this.down = this;
        this.size = 0;
        this.candidate = candidateNode;
        this.constraintColumn = null;
    }
}

class DLX {
    constructor(size) {
        this.SIZE = size;
        this.head = new Node();
        this.columnHeader = this.head;
        this.positionConstraints = new Map();
        this.rowConstraints = new Map();
        this.columnConstraints = new Map();
        this.gridConstraints = new Map();
        this.candidates = new Map();
        this.solutions = [];
        this.solutionArr = [];

        this.initializePositionConstraints();
        this.initializeRowConstraints();
        this.initializeColumnConstraints();
        this.initializeGridConstraints();
    }

    addConstraintColumn(node) {
        this.columnHeader.right.left = node;
        node.right = this.columnHeader.right;
        this.columnHeader.right = node;
        node.left = this.columnHeader;
        this.columnHeader = node;
    }

    initializePositionConstraints() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                let node = new Node();
                this.addConstraintColumn(node);
                this.positionConstraints.set(`${row},${col}`, node);
            }
        }
    }

    initializeRowConstraints() {
        for (let row = 0; row < this.SIZE; row++) {
            for (let digit = 1; digit <= this.SIZE; digit++) {
                let node = new Node();
                this.addConstraintColumn(node);
                this.rowConstraints.set(`${row},${digit}`, node);
            }
        }
    }

    initializeColumnConstraints() {
        for (let col = 0; col < this.SIZE; col++) {
            for (let digit = 1; digit <= this.SIZE; digit++) {
                let node = new Node();
                this.addConstraintColumn(node);
                this.columnConstraints.set(`${col},${digit}`, node);
            }
        }
    }

    initializeGridConstraints() {
        for (let grid = 0; grid < this.SIZE; grid++) {
            for (let digit = 1; digit <= this.SIZE; digit++) {
                let node = new Node();
                this.addConstraintColumn(node);
                this.gridConstraints.set(`${grid},${digit}`, node);
            }
        }
    }

    connectRowNodes(posNode, rowNode, colNode, gridNode) {
        posNode.right = rowNode;
        rowNode.left = posNode;
        rowNode.right = colNode;
        colNode.left = rowNode;
        colNode.right = gridNode;
        gridNode.left = colNode;
        gridNode.right = posNode;
        posNode.left = gridNode;
    }

    addRowNodeToColumn(constraint, row) {
        constraint.up.down = row;
        row.up = constraint.up;
        row.down = constraint;
        constraint.up = row;
        row.constraintColumn = constraint;
        constraint.size++;
    }

    addOptionRow(digit, row, col, grid) {
        let posConstraint = this.positionConstraints.get(`${row},${col}`);
        let rowConstraint = this.rowConstraints.get(`${row},${digit}`);
        let colConstraint = this.columnConstraints.get(`${col},${digit}`);
        let gridConstraint = this.gridConstraints.get(`${grid},${digit}`);

        let candidate = new CandidateNode(digit, row, col);

        let posNode = new Node(candidate);
        let rowNode = new Node(candidate);
        let colNode = new Node(candidate);
        let gridNode = new Node(candidate);

        this.connectRowNodes(posNode, rowNode, colNode, gridNode);

        this.addRowNodeToColumn(posConstraint, posNode);
        this.addRowNodeToColumn(rowConstraint, rowNode);
        this.addRowNodeToColumn(colConstraint, colNode);
        this.addRowNodeToColumn(gridConstraint, gridNode);
    }

    cover(constraintCol) {
        constraintCol.right.left = constraintCol.left;
        constraintCol.left.right = constraintCol.right;
        for (let row = constraintCol.down; row !== constraintCol; row = row.down) {
            for (let col = row.right; col !== row; col = col.right) {
                col.down.up = col.up;
                col.up.down = col.down;
            }
        }
    }

    uncover(constraintCol) {
        for (let row = constraintCol.up; row !== constraintCol; row = row.up) {
            for (let col = row.left; col !== row; col = col.left) {
                col.down.up = col;
                col.up.down = col;
            }
        }
        constraintCol.right.left = constraintCol;
        constraintCol.left.right = constraintCol;
    }

    getConstraintWithLeastOptions() {
        let currentCol = this.head.right;
        let minOptionsCol = currentCol;
        while (currentCol !== this.head) {
            if (currentCol.size < minOptionsCol.size) {
                minOptionsCol = currentCol;
            }
            currentCol = currentCol.right;
        }
        return minOptionsCol;
    }

    search(step) {
        if (this.head.right === this.head) {
            this.solutionArr.push([...this.solutions]);
            return true;
        }
        let found = false;
        let constraint = this.getConstraintWithLeastOptions();

        if (constraint !== constraint.down) {
            this.cover(constraint);
            for (let row = constraint.down; row !== constraint; row = row.down) {
                this.solutions.push(row.candidate);
                for (let col = row.right; col !== row; col = col.right) {
                    this.cover(col.constraintColumn);
                    col.constraintColumn.size--;
                }

                if (this.search(step + 1)) {
                    found = true;
                    break;
                    
                }

                for (let col = row.left; col !== row; col = col.left) {
                    this.uncover(col.constraintColumn);
                    col.constraintColumn.size++;
                }

                this.solutions.pop();
            }
            this.uncover(constraint);
        }
        return found;
    }

    solve() {
        this.solutions = [];
        this.search(0);
    }
}

class SudokuSolver {
    constructor() {
        this.SIZE = 9;
        this.SUBGRID_SIZE = 3;
    }

    getGridID(row, col) {
        return Math.floor(row / this.SUBGRID_SIZE) * this.SUBGRID_SIZE + Math.floor(col / this.SUBGRID_SIZE);
    }

    isValidOption(digit, row, col, grid, rows, cols, grids) {
        if (rows[row].has(digit)) return false;
        if (cols[col].has(digit)) return false;
        if (grids[grid].has(digit)) return false;
        return true;
    }

    solveSudoku(board) {
        const grids = Array.from({ length: this.SIZE }, () => new Set());
        const rows = Array.from({ length: this.SIZE }, () => new Set());
        const cols = Array.from({ length: this.SIZE }, () => new Set());

        const dlx = new DLX(this.SIZE);

        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                let cell = board[row][col];
                if (cell !== '') {
                    let digit = parseInt(cell, 10);
                    rows[row].add(digit);
                    cols[col].add(digit);
                    grids[this.getGridID(row, col)].add(digit);
                }
            }
        }

        for (let row = 0; row < this.SIZE; row++) {
            for (let col = 0; col < this.SIZE; col++) {
                if (board[row][col] === '') {
                    for (let digit = 1; digit <= 9; digit++) {
                        if (this.isValidOption(digit, row, col, this.getGridID(row, col), rows, cols, grids)) {
                            dlx.addOptionRow(digit, row, col, this.getGridID(row, col));
                        }
                    }
                } else {
                    let digit = parseInt(board[row][col], 10);
                    dlx.addOptionRow(digit, row, col, this.getGridID(row, col));
                }
            }
        }
        const startTime = performance.now();
        dlx.solve();
        const endTime = performance.now();
        const timeElapsed=((endTime - startTime) / 1000).toFixed(5)
        console.log(timeElapsed);

        const solutions = [];
        for (let solution of dlx.solutionArr) {
            const solvedBoard = board.map(row => row.slice());
            for (let candidate of solution) {
                solvedBoard[candidate.row][candidate.col] = (candidate.digit);
            }
            solutions.push(solvedBoard);
        }
        if(solutions.length)
        return {solutions:solutions,timeElapsed:timeElapsed};
        else return {timeElapsed:timeElapsed};
    }
}
export default SudokuSolver;