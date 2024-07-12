import { useState,useEffect} from 'react';
import SudokuSolver from './solvers/DLX';
import backTrackingSolver from './solvers/backtracking';
function App() {
  const rows = Array.from({ length: 9 });
  const initialGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }).fill(''));
  const [grid, setGrid] = useState(initialGrid);
  const [fixedGrid, setFixedGrid] = useState(initialGrid);
  const [errorGrid, setErrorGrid] = useState(initialGrid);
  const [count,setCount]=useState(0);
  const [error,setError]=useState(false);
  const [solved,setSolved]=useState(false);
  const [timeElapsed,setTimeElapsed]=useState('');

  useEffect(()=>{
    let cnt=0;
    for(let i=0;i<9;i++){
      for(let j=0;j<9;j++){
        cnt+=grid[i][j]!='';
      }
    }
    setCount(cnt);
  },[grid])
  const reset=()=>{
    setGrid((initialGrid));
    check(grid);
    setError(false);
  }
  const check = (grid) => {
    let newGrid=Array.from({ length: 9 }, () => Array.from({ length: 9 }).fill(0));
    let found=0;
    for (let i = 0; i < 9; i++) {
      let pos = {};

      for (let j = 0; j < 9; j++) {
        let num = grid[i][j];

        if (num === '') continue;

        if (!pos[num]) {
          pos[num] = [];
        } else {
          newGrid[i][j]=1;
          found=1;
          for (let k = 0; k < pos[num].length; k++) {
           newGrid[i][pos[num][k]]=1;
          }
        }

        pos[num].push(j);
      }
    }
    for (let i = 0; i < 9; i++) {
      let pos = {};

      for (let j = 0; j < 9; j++) {
        let num = grid[j][i];

        if (num === '') continue;

        if (!pos[num]) {
          pos[num] = [];
        } else {
          newGrid[j][i]=1;
          found=1;
          for (let k = 0; k < pos[num].length; k++) {
            newGrid[pos[num][k]][i]=1;
          }
        }

        pos[num].push(j);
      }
    }
    for(let i=0;i<9;i+=3){
      for(let j=0;j<9;j+=3){
        let pos={};
        for(let row=i;row<i+3;row++){
          for(let col=j;col<j+3;col++){
            let num=grid[row][col];
            if(num=='')continue;
            if(!pos[num])pos[num]=[];
            else {
              found=1;
              newGrid[row][col]=1;
              for(let k=0;k<pos[num].length;k++){
                let {row,col}=pos[num][k];
                newGrid[row][col]=1;
              }
            }
            pos[num].push({row:row,col:col});
          
          }
        }
      }
    }
    if(found)setError(true);
    else setError(false);
    setErrorGrid(newGrid)
  }
  const handleInput = (e, row, col) => {
    let { value } = e.target;
    console.log(value, row, col);
    if (value <= 0 || value > 9 || isNaN(value)) {
      value = '';
    }
    setSolved(false);
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = value;
      check(newGrid);
      return newGrid;
    });
  }
  const solveDLX=()=>{
    const solver=new SudokuSolver();
    const result=solver.solveSudoku(grid);
    const {solutions,timeElapsed}=result;
    if(!solutions){
      alert('No solution Found!!! ');
    }
    else {
    setGrid(solutions[0]);
    setTimeElapsed(timeElapsed);
    setSolved(true);
    }

  }
  const solveBackTracking=()=>{
    const solver=new backTrackingSolver();
    const result=solver.solveSudoku(grid);
    const {solution,timeElapsed}=result;
    if(!solution){
      alert('No solution Found!!! ');
    }
    else {
    setGrid(solution);
    setTimeElapsed(timeElapsed);
    setSolved(true);
    }
  }
  return (
    <div className='h-screen w-screen flex flex-col items-center my-8 mx-2'>
      <div className='w-full lg:w-1/2'>
        <p className='text-3xl font-medium text-center'>Sudoku Solver</p>
        {count<17 && <p className="w-full text-red-500 text-center">Enter at least 17 values to start solving</p>}
        {solved &&<p className='w-full text-center flex justify-between text-2xl text-bold'><span>Time Elapsed:</span> <span>{timeElapsed} seconds</span></p>}
        <p className='w-full flex justify-evenly my-4 gap-2'>
          <button className={`w-40 border-2 font-semibold  text-white border-black  ${(count<17||error)?'bg-gray-500 cursor-not-allowed ':'bg-green-500 hover:bg-gray-700'}`}
          disabled={count<17 || error}
          onClick={solveBackTracking}>
            Solve Using Backtracking
          </button>
          <button className={`w-40 h-16  border-2 font-semibold  text-white border-black  ${(count<17||error)?'bg-gray-500 cursor-not-allowed ':'bg-green-500 hover:bg-gray-700'}`}
          disabled={count<17 || error}
          onClick={solveDLX}>
            Solve Using DLX
          </button>
          <button className='w-40 border-2 font-semibold bg-red-500 text-white border-black hover:bg-gray-700'
          onClick={reset}>
            Reset
          </button>
        </p>
      </div>
      <table>
        <tbody>
          {rows.map((ele, row) => (
            <tr className='w-full ' key={row}>
              {rows.map((ele, col) => (
                <td
                  className={`w-12 h-12 md:w-16 md:h-16  justify-center
                    ${col % 3 === 2 ? 'border-r-2 border-black' : ''}
                    ${row % 3 === 2 ? 'border-b-2 border-black' : ''}
                    ${col === 0 ? 'border-l-2 border-black' : ''}
                    ${row === 0 ? 'border-t-2 border-black' : ''}`}
                  key={col}>
                  <input
                    type='number'
                    id="myNumberInput"
                    className={`h-full w-full text-4xl text-center border-none outline-none cursor-default  ${errorGrid[row][col] ? 'bg-red-400' : 'bg-sky-100  focus:bg-sky-500'}`}
                    value={parseInt(grid[row][col])}
                    onChange={(e) => handleInput(e, row, col)}
                    min={1}
                    max={9}
                    onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


//24 -> row=2 ,col=6