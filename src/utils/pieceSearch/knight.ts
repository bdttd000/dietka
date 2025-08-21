import { findPiece } from "../../types/chessTypes";
import {
  parseIndexToPosition,
  parsePositionToIndex,
} from "../formatting/parseLetter";
import { possibleKnightMoves } from "../helpers/possiblePiecesMoves";

export const findKnight = (pieceInfo: findPiece): string => {
  const [destRow, destColumn] = parsePositionToIndex(pieceInfo.destination);
  const possibleMoves = possibleKnightMoves(destRow, destColumn);

  for (const [row, column] of possibleMoves) {
    if (
      row >= 0 &&
      row <= 7 &&
      column >= 0 &&
      column <= 7 &&
      (pieceInfo.helpers[0] === null || pieceInfo.helpers[0] === row) &&
      (pieceInfo.helpers[1] === null || pieceInfo.helpers[1] === column) &&
      pieceInfo.chessBoard[row][column] === pieceInfo.playerToMove + "n"
    ) {
      return parseIndexToPosition(row, column);
    }
  }

  return "unknown";
};
