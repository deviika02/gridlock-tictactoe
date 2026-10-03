# Gridlock — Tic-Tac-Toe AI

A dependency-free Tic-Tac-Toe game with an unbeatable computer opponent.

## Run it

Open `index.html` in any modern browser. No build step or installation is required.

## How the AI works

The board is stored as a nine-element array. Empty cells contain `''`, the human player is `X`, and the computer is `O`.

`minimax()` tries every legal move recursively. It gives a computer win a positive score, a human win a negative score, and a draw `0`. The `depth` value makes the computer prefer winning sooner and delay a loss for as long as possible. When it is the computer's turn, it chooses the highest score; when it is the human's turn, it assumes the human chooses the lowest score.

Because standard Tic-Tac-Toe has a small, finite game tree, the computer can evaluate every possible continuation before making a move. That is why it cannot be beaten: a perfect human can only force a draw.
