document.addEventListener("DOMContentLoaded", function () {
    const palavras = document.querySelectorAll(".palavra");
    const respostaUsuario = document.getElementById("resposta-usuario");
    const verificarBtn = document.getElementById("verificar");
    const feedback = document.getElementById("feedback");
    const popup = document.getElementById("popup");
    const fecharPopupBtn = document.getElementById("fechar-popup");

    // Função para embaralhar um array (Algoritmo de Fisher-Yates)
    function embaralhar(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Embaralha os botões antes de exibi-los
    const container = document.getElementById("palavras-disponiveis");
    const palavrasArray = Array.from(palavras); // Converte NodeList em Array
    embaralhar(palavrasArray);

    // Remove os botões do container e os adiciona de volta embaralhados
    palavrasArray.forEach(botao => container.appendChild(botao));

    let palavrasSelecionadas = [];

    palavras.forEach(palavra => {
        palavra.addEventListener("click", function () {
            if (!palavra.disabled) {
                palavrasSelecionadas.push(palavra.innerText);

                let botaoResposta = document.createElement("button");
                botaoResposta.innerText = palavra.innerText;
                botaoResposta.classList.add("resposta");
                botaoResposta.setAttribute("draggable", true);

                // Eventos para toque (mobile)
                botaoResposta.addEventListener("touchstart", touchStart, { passive: false });
                botaoResposta.addEventListener("touchend", touchEnd);

                // Eventos para arrastar (desktop)
                botaoResposta.addEventListener("dragstart", () => {
                    botaoResposta.classList.add("dragging");
                });

                botaoResposta.addEventListener("dragend", () => {
                    botaoResposta.classList.remove("dragging");
                    atualizarOrdem();
                });

                // Evento para remover palavra ao clicar
                botaoResposta.addEventListener("click", function () {
                    respostaUsuario.removeChild(botaoResposta);
                    palavrasSelecionadas = palavrasSelecionadas.filter(p => p !== palavra.innerText);
                    palavra.disabled = false;
                });

                respostaUsuario.appendChild(botaoResposta);
                palavra.disabled = true;
            }
        });
    });

    // Permitir reorganização ao arrastar e soltar (desktop)
    respostaUsuario.addEventListener("dragover", (event) => {
        event.preventDefault();
        const draggingElement = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(respostaUsuario, event.clientX);
        if (afterElement == null) {
            respostaUsuario.appendChild(draggingElement);
        } else {
            respostaUsuario.insertBefore(draggingElement, afterElement);
        }
    });

    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll(".resposta:not(.dragging)")];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function atualizarOrdem() {
        palavrasSelecionadas = [...respostaUsuario.querySelectorAll(".resposta")].map(btn => btn.innerText);
    }

    verificarBtn.addEventListener("click", function () {
        const respostaCorreta = ["Yo", "Leticia", "acepto", "salir", "con", "Cris", "en", "una", "cita", "súper", "romántica" ];
        if (JSON.stringify(palavrasSelecionadas) === JSON.stringify(respostaCorreta)) {
            feedback.innerText = "✅ Correto! Parabéns!";
            feedback.style.color = "green";
            popup.style.display = "flex"; // mostra popup
        } else {
            feedback.innerText = "❌ Errado! Tente novamente.";
            feedback.style.color = "red";
        }
    });

    //fechar popup se clicar no ok
    fecharPopupBtn.addEventListener("click", function () { 
        popup.style.display = "none";
    });


    // 🔹 Suporte a dispositivos móveis (Toque + Arrastar) com centralização perfeita
    let activeElement = null;
    let cloneElement = null;
    let offsetX = 0, offsetY = 0;

    function touchStart(event) {
        event.preventDefault(); // Evita o clique padrão
        document.body.style.overflow = "hidden"; // 🔥 Bloqueia a rolagem da página

        activeElement = event.target;

        // Pegamos a posição do toque
        const touch = event.touches[0];
        const rect = activeElement.getBoundingClientRect();
        
        // Calculamos o deslocamento do toque dentro do botão
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        // Criamos um clone para seguir o dedo
        cloneElement = activeElement.cloneNode(true);
        cloneElement.style.position = "absolute";
        cloneElement.style.opacity = "0.7";
        cloneElement.style.pointerEvents = "none";
        cloneElement.style.width = rect.width + "px"; // Mantém o mesmo tamanho
        cloneElement.style.height = rect.height + "px";
        cloneElement.style.left = touch.clientX - offsetX + "px";
        cloneElement.style.top = touch.clientY - offsetY + "px";

        document.body.appendChild(cloneElement);
        document.addEventListener("touchmove", touchMove, { passive: false });
    }

    function touchMove(event) {
        event.preventDefault(); // 🔥 Bloqueia a rolagem ao mover o item
        const touch = event.touches[0];

        // Movemos o clone no dedo com centralização correta
        cloneElement.style.left = touch.clientX - offsetX + "px";
        cloneElement.style.top = touch.clientY - offsetY + "px";
    }

    function touchEnd(event) {
        document.removeEventListener("touchmove", touchMove);
        document.body.style.overflow = ""; // 🔥 Reativa a rolagem da página

        document.body.removeChild(cloneElement);
        cloneElement = null;

        const touch = event.changedTouches[0];
        const afterElement = getDragAfterElement(respostaUsuario, touch.clientX);

        if (afterElement == null) {
            respostaUsuario.appendChild(activeElement);
        } else {
            respostaUsuario.insertBefore(activeElement, afterElement);
        }

        activeElement = null;
        atualizarOrdem();
    }
});
