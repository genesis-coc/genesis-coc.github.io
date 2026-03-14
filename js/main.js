document.addEventListener('DOMContentLoaded', () => {
    const get = (id) => document.getElementById(id);

    const views = {
        art1: get('textoNormas1'),
        art2: get('textoNormas2'),
        reg1: get('orgReg1'),
        san1: get('norSan1'),
        reg2: get('orgReg2'),
        san2: get('norSan2')
    };

    const btns = {
        main1: get('btn1'),
        main2: get('btn2'),
        sub1Reg: get('btn3'),
        sub1San: get('btn4'),
        sub2Reg: get('btn5'),
        sub2San: get('btn6')
    };

    function updateSubTabs(activeBtn, inactiveBtn) {
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.classList.remove('inactive');
        }
        if (inactiveBtn) {
            inactiveBtn.classList.add('inactive');
            inactiveBtn.classList.remove('active');
        }
    }

    // Navegación Art 1
    btns.main1.onclick = () => {
        views.art1.classList.remove('ocultar');
        views.art2.classList.add('ocultar');
        btns.main1.classList.add('active');
        btns.main2.classList.remove('active');
        // Reset a la primera subpestaña
        views.reg1.classList.remove('ocultar');
        views.san1.classList.add('ocultar');
        updateSubTabs(btns.sub1Reg, btns.sub1San);
    };

    // Navegación Art 2
    btns.main2.onclick = () => {
        views.art2.classList.remove('ocultar');
        views.art1.classList.add('ocultar');
        btns.main2.classList.add('active');
        btns.main1.classList.remove('active');
        // Reset a la primera subpestaña
        views.reg2.classList.remove('ocultar');
        views.san2.classList.add('ocultar');
        updateSubTabs(btns.sub2Reg, btns.sub2San);
    };

    // Sub-botones Art 1
    btns.sub1Reg.onclick = () => {
        views.reg1.classList.remove('ocultar');
        views.san1.classList.add('ocultar');
        updateSubTabs(btns.sub1Reg, btns.sub1San);
    };
    btns.sub1San.onclick = () => {
        views.reg1.classList.add('ocultar');
        views.san1.classList.remove('ocultar');
        updateSubTabs(btns.sub1San, btns.sub1Reg);
    };

    // Sub-botones Art 2
    btns.sub2Reg.onclick = () => {
        views.reg2.classList.remove('ocultar');
        views.san2.classList.add('ocultar');
        updateSubTabs(btns.sub2Reg, btns.sub2San);
    };
    btns.sub2San.onclick = () => {
        views.reg2.classList.add('ocultar');
        views.san2.classList.remove('ocultar');
        updateSubTabs(btns.sub2San, btns.sub2Reg);
    };
});