const TargetType = {
  point: 'point',
  faceCard: 'faceCard',
  jack: 'jack'
};
// CommonJS fallback
if (typeof module !== 'undefined') {
  module.exports = TargetType;
}
export default TargetType;
