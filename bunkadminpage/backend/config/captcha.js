import svgCaptcha from 'svg-captcha';

export const generateCaptcha = () => {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 3,
        color: true,
        background: '#0a1924'
    });
    
    return {
        question: captcha.data, // This is the SVG string
        answer: captcha.text    // This is the alphanumeric string (e.g., 'YR890')
    };
};

export const verifyCaptcha = (userAnswer, correctAnswer) => {
    // Case insensitive comparison for better UX
    return userAnswer?.toLowerCase() === correctAnswer?.toLowerCase();
};

