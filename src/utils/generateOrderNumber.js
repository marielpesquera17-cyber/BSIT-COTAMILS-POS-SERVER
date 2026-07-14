/**
 * Generates a unique order number
 * Example:
 * 531
 */
const generateOrderNumber = () => {
  return Math.floor(100 + Math.random() * 900);
};

export default generateOrderNumber;
