// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen
// by writing 'black' in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen by writing
// 'white' in every pixel;
// the screen should remain fully clear as long as no key is pressed.

(LOOP)
    @KBD
    D = M
    @CLEAR
    D;JEQ
(BLACK)
    @fill
    M = -1
    @DRAW
    0;JMP
(CLEAR)
    @fill
    M = 0
    @DRAW
    0;JMP
(DRAW)
    @SCREEN
    D = A
    @startscr
    M = D
    @endscr
    M = D
    // 16384
    @8192
    D = A
    @endscr
    M = M + D
    @startscr
    D = M
    @currentscr
    M = D
(TRAVEL)
    @currentscr
    D = M
    @endscr
    D = M - D
    @LOOP
    D;JEQ

    @fill
    D = M
    @currentscr
    A = M
    M = D
    @currentscr
    M = M + 1
    @TRAVEL
    0;JMP