document.addEventListener('DOMContentLoaded', () => {
    // Captura de elementos
    const art1 = document.getElementById('textoNormas1');
    const art2 = document.getElementById('textoNormas2');
    const orgReg1 = document.getElementById('orgReg1');
    const norSan1 = document.getElementById('norSan1');
    const orgReg2 = document.getElementById('orgReg2');
    const norSan2 = document.getElementById('norSan2');

    const btn1 = document.getElementById('btn1');
    const btn2 = document.getElementById('btn2');
    const btn3 = document.getElementById('btn3'); // Reg1
    const btn4 = document.getElementById('btn4'); // San1
    const btn5 = document.getElementById('btn5'); // Reg2
    const btn6 = document.getElementById('btn6'); // San2

    function resetAll() {
        art1.classList.add('ocultar');
        art2.classList.add('ocultar');
        orgReg1.classList.add('ocultar');
        norSan1.classList.add('ocultar');
        orgReg2.classList.add('ocultar');
        norSan2.classList.add('ocultar');
        btn1.classList.remove('active');
        btn2.classList.remove('active');
    }

    // Art.1 Diarias
    btn1.onclick = () => {
        resetAll();
        art1.classList.remove('ocultar');
        orgReg1.classList.remove('ocultar');
        btn1.classList.add('active');
    };

    // Art.2 Ligas
    btn2.onclick = () => {
        resetAll();
        art2.classList.remove('ocultar');
        orgReg2.classList.remove('ocultar');
        btn2.classList.add('active');
    };

    // Sub-botones
    btn3.onclick = () => {
        orgReg1.classList.remove('ocultar');
        norSan1.classList.add('ocultar');
    };
    btn4.onclick = () => {
        orgReg1.classList.add('ocultar');
        norSan1.classList.remove('ocultar');
    };
    btn5.onclick = () => {
        orgReg2.classList.remove('ocultar');
        norSan2.classList.add('ocultar');
    };
    btn6.onclick = () => {
        orgReg2.classList.add('ocultar');
        norSan2.classList.remove('ocultar');
    };
});