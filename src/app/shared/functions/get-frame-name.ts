export function getFrameName(planName: string): string {
  let frameName = '';

  switch (planName) {
    case 'Battens':
      frameName = 'CP';
      break;
    case 'Purlins':
      frameName = 'RP';
      break;
    case 'Roof Sheet':
      frameName = 'SHEETS';
      break;
    case 'Braces':
      frameName = 'BRACES';
      break;
    case 'Roof Panels':
      frameName = 'Rpnl';
      break;
    default:
      frameName = 'FRAMECAD';
  }

  return frameName;
}
