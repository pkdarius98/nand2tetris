// Multiplies R0 and R1 and stores the result in R2.
// Assumes that R0 >= 0, R1 >= 0, and R0 * R1 < 32768.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// product = 0
    @product
    M = 0
// i = 0
    @i
    M = 0
(LOOP)
// if i = R1 go to end
    @i
    D = M
    @R1
    D = D - M
    @STOP
    D;JEQ
// product += R0
    @product
    D = M
    @R0
    D = D + M
    @product
    M = D
// i = i+1
    @i
    M = M + 1
// go to loop
    @LOOP
    0;JMP
(STOP)
    @product
    D = M
    @R2
    M = D
(END)
    @END
    0;JMP