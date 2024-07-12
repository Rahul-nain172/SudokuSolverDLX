class backTrackingSolver{
    constructor() {
        this.checkRow = Array.from({ length: 9 }, () => Array(10).fill(0));
        this.checkCol = Array.from({ length: 9 }, () => Array(10).fill(0));
        this.checkSquare = Array.from({ length: 9 }, () => Array(10).fill(0));
    }

    search(cell, board) {
        if (cell === 81) return true;
        const row = Math.floor(cell / 9);
        const col = cell % 9;
        const sqInd = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        
        if (board[row][col] !== '') return this.search(cell + 1, board);
        
        for (let i = 1; i <= 9; i++) {
            if (!this.checkRow[row][i] && !this.checkCol[col][i] && !this.checkSquare[sqInd][i]) {
                board[row][col] = i;
                this.checkRow[row][i] = 1;
                this.checkCol[col][i] = 1;
                this.checkSquare[sqInd][i] = 1;
                
                if (this.search(cell + 1, board)) return true;
                
                board[row][col] = '';
                this.checkRow[row][i] = 0;
                this.checkCol[col][i] = 0;
                this.checkSquare[sqInd][i] = 0;
            }
        }
        return false;
    }

    solveSudoku(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] !== '') {
                    const num = board[i][j];
                    const sqInd = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                    this.checkRow[i][num] = 1;
                    this.checkCol[j][num] = 1;
                    this.checkSquare[sqInd][num] = 1;
                }
            }
        }
        let startTime=performance.now();
        let found=this.search(0, board);
        let endTime=performance.now();
        let timeElapsed=((endTime-startTime)/1000).toFixed(5);
        if(found){
            return {solution:board,timeElapsed:timeElapsed};
        }
        else return {timeElapsed:timeElapsed};
    }
}
export default backTrackingSolver;