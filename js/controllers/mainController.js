var app = angular.module("main", []);
app.controller("MainController", function($scope, $window, $compile, $q) {
    $scope.words = [];
    $scope.cubes = [
        ['R', 'I', 'F', 'O', 'B', 'X'],
        ['I', 'F', 'E', 'H', 'E', 'Y'],
        ['D', 'E', 'N', 'O', 'W', 'S'],
        ['U', 'T', 'O', 'K', 'N', 'D'],
        ['H', 'M', 'S', 'R', 'A', 'O'],
        ['L', 'U', 'P', 'E', 'T', 'S'],
        ['A', 'C', 'I', 'T', 'O', 'A'],
        ['Y', 'L', 'G', 'K', 'U', 'E'],
        ['Qu', 'B', 'M', 'J', 'O', 'A'],
        ['E', 'H', 'I', 'S', 'P', 'N'],
        ['V', 'E', 'T', 'I', 'G', 'N'],
        ['B', 'A', 'L', 'I', 'Y', 'T'],
        ['E', 'Z', 'A', 'V', 'N', 'D'],
        ['R', 'A', 'L', 'E', 'S', 'C'],
        ['U', 'W', 'I', 'L', 'R', 'G'],
        ['P', 'A', 'C', 'E', 'M', 'D']
    ];
    $scope.currWord = '';
    $scope.suggest = true; //whether suggest mode is active;
    $scope.timer = 0; //timer for med and hrd mode;
    $scope.time = 180000; //current time
    $scope.timerOn = false;
    $scope.currCubes = [];
    $scope.selected = [];
    $scope.prevPos = {
        x: 0,
        y: 0
    }
    $scope.cubePos = [{
        x: 0,
        y: 0
    }, {
        x: 1,
        y: 0
    }, {
        x: 2,
        y: 0
    }, {
        x: 3,
        y: 0
    }, {
        x: 0,
        y: 1
    }, {
        x: 1,
        y: 1
    }, {
        x: 2,
        y: 1
    }, {
        x: 3,
        y: 1
    }, {
        x: 0,
        y: 2
    }, {
        x: 1,
        y: 2
    }, {
        x: 2,
        y: 2
    }, {
        x: 3,
        y: 2
    }, {
        x: 0,
        y: 3
    }, {
        x: 1,
        y: 3
    }, {
        x: 2,
        y: 3
    }, {
        x: 3,
        y: 3
    }]
    $scope.drawCubes = function() {
        $scope.currCubes = [];
        $scope.selected = [];
        for (var i = 0; i < $scope.cubes.length; i++) {
            $scope.currCubes.push($scope.cubes[i][Math.floor(Math.random() * 6)]);
            $scope.selected.push(0);
        }
        //got cubes, now reshuffle
        $scope.currCubes.sort(function(a, b) {
            if (Math.random() > 0.5) {
                return 1;
            }
            return 1;
        });
        console.log($scope.currCubes)
        console.log($scope.currCubes.reduce(function(p, c, i, a) {
            return p + c;
        }));
    };
    $scope.selectToggle = function(cube) {
        if ($scope.selected[cube]) {
            //deselecting
            $scope.selected[cube] = 0
        } else if ($scope.currWord.length) {
            $scope.selectFun(cube); //run Selector function to see if this is a valid letter
        } else {
            //first letter
            $scope.selected[cube] = 1;
            $scope.currWord = $scope.currCubes[cube].toUpperCase();
            $scope.prevPos.x = $scope.cubePos[cube].x;
            $scope.prevPos.y = $scope.cubePos[cube].y;
            console.log($scope.currWord);
        }

    }
    $scope.selectFun = function(ind) {
        var difX = $scope.prevPos.x - $scope.cubePos[ind].x;
        var difY = $scope.prevPos.y - $scope.cubePos[ind].y;
        //now check four possiblities. Top, left, right, bottom
        var unreachable = true;
        if ((difX == -1 && difY == 0) || (difX == 1 && difY == 0) || (difX == 0 && difY == -1) || (difX == 0 && difY == 1)) {
            unreachable = false;
        }
        console.log('old', $scope.prevPos.x, $scope.prevPos.y, 'curr', $scope.cubePos[ind].x, $scope.cubePos[ind].y, 'word', $scope.currWord)
        if (!unreachable) {
            $scope.selected[ind] = 1;
            $scope.currWord += $scope.currCubes[ind].toUpperCase();
            $scope.prevPos.x = $scope.cubePos[ind].x;
            $scope.prevPos.y = $scope.cubePos[ind].y;
            var dup = false;
            for (var n = 0; n < $scope.words.length; n++) {
                if ($scope.words[n].word == $scope.currWord) {
                    dup = true;
                }
            }
            if ($scope.suggest && $scope.currWord.length > 2) {
                //only run if we're in suggest mode and word is of legal length and word's not already obtained
                $.ajax({
                    url: 'https://en.wiktionary.org/w/api.php?action=query&prop=categories&titles=' + $scope.currWord.toLowerCase() + '&format=json',
                    dataType: 'jsonp'
                }).done(function(res) {
                    var cats = res.query.pages[Object.keys(res.query.pages)[0]].categories;

                    var isEng = false;
                    console.log(cats)
                    for (var i = 0; i < cats.length; i++) {
                        if (cats[i].title.indexOf('Category:English') !== -1 || cats[i].title.indexOf('Category:American') !== -1 || cats[i].title.indexOf('Category:1000 English')) {
                            isEng = true;
                        }
                    }
                    if (isEng) {
                        var val = 0;
                        if ($scope.currWord.length < 5) {
                            val = 1;
                        } else if ($scope.currWord.length < 6) {
                            val = 2;
                        } else if ($scope.currWord.length < 7) {
                            val = 3;
                        } else if ($scope.currWord.length < 8) {
                            val = 5;
                        } else {
                            val = 11;
                        }
                        $scope.words.push({
                            word: $scope.currWord,
                            val: val
                        });
                        console.log($scope.words)
                        $scope.$digest();
                    }
                })
            }
        } else {
            console.log('Cannot pick that!')
        }

    }
    window.onkeyup = function(e) {
            if (e.which == 27) {
                //escape clear clears the board
                e.preventDefault();
                $scope.currWord = '';
                for (var i = 0; i < $scope.selected.length; i++) {
                    $scope.selected[i] = 0;
                }
                $scope.$digest();
            } else if (e.which == 13) {
                //enter submits a word (if hard mode)
                e.preventDefault();
                console.log('user pressed enter');
            }
        }
        //make panel draggable
    $(function() {
        $('.draggable').draggable({
            containment: [0, 0, $(window).width() / 2, $(window).height() / 2]
        });
    });
    $scope.newGame = function(type) {
        $scope.words = [];
        $scope.currWord = '';
        $scope.selected = [];
        clearInterval($scope.timer);
        $scope.time = 180000;
        if (!type) {
            //ez mode
            $scope.suggest = true;
            $scope.timerOn = false;
        } else if (type == 1) {
            //med mode
            $scope.suggest = true;
            $scope.timerOn = true;
            $scope.timer = setInterval(function() {
                $scope.time -= 100;
                $scope.$digest();
                if ($scope.time <= 0) {
                    bootbox.alert('Game over!');
                    clearInterval($scope.timer);
                }
            }, 100);
        }else{
            //hard mode
            $scope.suggest = false;
            $scope.timerOn = true;
            $scope.timer = setInterval(function() {
                $scope.time -= 100;
                $scope.$digest();
                if ($scope.time <= 0) {
                    bootbox.alert('Game over!');
                    clearInterval($scope.timer);
                }
            }, 100);
        }
        $scope.drawCubes();
    };
});
/*NOTES
Modes: Easy = No timer, suggest active. Medium = Timer, suggest active. Hard: Timer, suggest inactive
Need to figure out how to remove EXACTLY the right letter. IOW, if word is 'banana', need to know which 'a' to remove.
Need to use ng-repeat table to list current words.
Should we enable other languages? Preferably just spanish/french/german for now
Way to load other boards (for competition)?
*/
