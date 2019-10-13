var moveCount;
var size;
var bombs;
var name;
var board;

function newGame() {
    moveCount = 0;
    size = document.getElementById("boardSize").value;
    bombs = document.getElementById("mineAmount").value;
    name = document.getElementById("name").value;
    board = makeBoard(size, bombs);
    startGame()
}

function startGame() {
    if (name == "") throw "no name entered";

    var table = document.getElementById('table');
    drawBoard(size);
    document.getElementById('cover').style.visibility = 'hidden';

    checkSquares();
    function checkSquares() {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if (board[i][j] == 2 ) {
                    var square = document.getElementById(i + "," + j);
                    var id = square.id.split(',');
                    openSquare(square, id)
                }
            }
        }
    }

    function clickSquare() {
        var square = document.getElementById(this.id);
        var id = square.id.split(',');

        if (board[parseInt(id[0])][parseInt(id[1])] == 1) {
            moveCount++;
            square.style.backgroundColor = '#D06E6E';
            square.innerHTML = "X";

            var nodes = document.getElementById('table').getElementsByTagName('td');
            gameOver(nodes, "Loss")
        } else if (board[parseInt(id[0])][parseInt(id[1])] == 0) {
            moveCount++;
            board[parseInt(id[0])][parseInt(id[1])] = 2;
            openSquare(square, id);

            if (checkIfWon()) {
                document.getElementById('cover').innerHTML = "You win";
                document.getElementById('cover').style.visibility = 'visible';
                var nodes1 = document.getElementById('table').getElementsByTagName('td');
                gameOver(nodes1, "Win")
            }
        }
    }

    function openSquare(square, id) {
        var ng = neighbours(parseInt(id[0]), parseInt(id[1]));
        var neighbouringBombs = 0;

        for (var i = 0; i < ng.length; i++) {
            var array = ng[i];
            if (board[array[0]][array[1]] == 1) {
                neighbouringBombs++
            }
        }

        square.style.backgroundColor = '#F1EBEB';
        if (neighbouringBombs > 0) {
            square.innerHTML = neighbouringBombs.toString();
        } else {
            square.innerHTML = '';
            for (var k = 0; k < ng.length; k++) {
                var closeBombs = 0;
                var array1 = ng[k];
                var neighboursOfNeighbours = neighbours(array1[0], array1[1]);

                for (var j = 0; j < neighboursOfNeighbours.length; j++) {
                    var array2 = neighboursOfNeighbours[j];
                    if (board[array2[0]][array2[1]] == 1) {
                        closeBombs++
                    }
                }

                var ngId = array1[0].toString() + ',' + array1[1].toString();
                if (board[array1[0]][array1[1]] != 2) {
                    document.getElementById(ngId).innerHTML = closeBombs.toString();
                }
            }
        }
    }

    function checkIfWon() {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if (board[i][j] == 0 ) {
                    return false;
                }
            }
        }
        return true;
    }

    function gameOver(nodes, result) {
        var scores = document.getElementById("scores");

        for (var j = 0; j < nodes.length; j++) {
            nodes[j].onclick = 'return false;';
            nodes[j].style.cursor = 'default';
        }
        var score = document.createElement("div");
        score.innerHTML = result + " - " + moveCount + " moves done";
        scores.appendChild(score);
        sendDataToServer(result)
    }

    function sendDataToServer(result) {
        var variablesToSend = "name=" + name
                                + "&boardSize=" + size
                                + "&bombAmount=" + bombs
                                + "&moves=" + moveCount
                                + "&result=" + result;

        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://dijkstra.cs.ttu.ee/~krjunu/cgi-bin/prax3/ResultToTxt.py", true);
        xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
        xhttp.send(variablesToSend);
    }

    function drawBoard(size) {
        table.innerHTML = '';

        for (var i = 0; i < size; i++) {
            var tr = document.createElement('tr');

            for (var j = 0; j < size; j++) {
                var td = document.createElement('td');
                td.id = i.toString() + "," + j.toString();
                td.onclick = clickSquare;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
    }

    function neighbours(x, y) {
        var list=[];
        for (var i=-1; i<=1; i++) {
            for (var j=-1; j<=1; j++) {
                // square is not a neighbour of itself
                if (i==0 && j==0) continue;
                // check whether the the neighbour is inside board bounds
                if ((x+i)>=0 && (x+i)<size && (y+j)>=0 && (y+j)<size) {
                    list.push([x+i,y+j]);
                }
            }
        }
        return list;
    }
}

function makeBoard(size, bombs) {
    var board=[];

    if (bombs>=size*size) throw "too many bombs for this size";
    if (bombs < 0) throw "Invalid number";

    // initialize board, filling with zeros
    for (var x=0; x<size; x++) {
        board[x]=[]; // insert empty sub array
        for (var y=0; y<size; y++) board[x][y]=0;
    }

    // now fill board with bombs in random positions
    var i=bombs;
    while (i>0) {
        // generate random x and y in range 0...size-1
        x=Math.floor(Math.random() * size);
        y=Math.floor(Math.random() * size);
        // put bomb on x,y unless there is a bomb already
        if (board[x][y]!=1) {
            board[x][y]=1;
            i--; // bomb successfully positioned, one less to go
            //console.log("positioned "+x+", "+y+" yet to go "+i);
        }
    }
    return board;
}

function loadGame() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var parts = xhttp.responseText.split(" ");
            name = parts[0];
            size = parseInt(parts[1]);
            bombs = parseInt(parts[2]);
            moveCount = parseInt(parts[3]);
            board = JSON.parse(parts[4]);
            startGame()
        }
    };
    var loadName = document.getElementById("name").value;
    if (loadName == "") throw "no name entered";
    xhttp.open("GET", "http://dijkstra.cs.ttu.ee/~krjunu/cgi-bin/prax3/LoadGame.py?" + "name=" + loadName, true);
    xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xhttp.send();
}

function saveGame() {
    var variablesToSend = "name=" + name
        + "&boardSize=" + size
        + "&bombAmount=" + bombs
        + "&moves=" + moveCount
        + "&board=" + JSON.stringify(board);
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://dijkstra.cs.ttu.ee/~krjunu/cgi-bin/prax3/SaveGame.py", true);
    xhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xhttp.send(variablesToSend);
}
