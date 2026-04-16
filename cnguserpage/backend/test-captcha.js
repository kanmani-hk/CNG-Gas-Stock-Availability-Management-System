console.log('Testing...');
import svgCaptcha from 'svg-captcha';
console.log('Got module:', !!svgCaptcha);
try {
  const captcha = svgCaptcha.create();
  console.log('Captcha success:', captcha.text);
} catch (e) {
  console.error('Captcha fail:', e);
}
