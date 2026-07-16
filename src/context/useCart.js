import { useContext } from "react";

// The provider defines its context at module scope.
// We read it via the exported handle from CartProvider.
import { __CartContext } from "./CartProvider.jsx";

export const useCart = () => useContext(__CartContext);

