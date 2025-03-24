document.addEventListener("DOMContentLoaded", function () {
    const palavras = document.querySelectorAll(".palavra");
    const respostaUsuario = document.getElementById("resposta-usuario");
    const verificarBtn = document.getElementById("verificar");
    const feedback = document.getElementById("feedback");
    const popup = document.getElementById("popup");
    const fecharPopupBtn = document.getElementById("fechar-popup");
    const palavrasDisponiveis = document.getElementById("palavras-disponiveis");

    let palavrasSelecionadas = [];

    palavras.forEach(palavra => {
        palavra.addEventListener("click", function () {
            if (!palavra.disabled) {
                palavrasSelecionadas.push(palavra.innerText);

                let botaoResposta = document.createElement("button");
                botaoResposta.innerText = palavra.innerText;
                botaoResposta.classList.add("resposta");
                botaoResposta.setAttribute("draggable", true);

                // Suporte para remover a palavra no desktop e mobile
                function removerPalavra() {
                    respostaUsuario.removeChild(botaoResposta);
                    palavrasSelecionadas = palavrasSelecionadas.filter(p => p !== palavra.innerText);

                    // Reinsere o botão na área de palavras disponíveis
                    palavra.disabled = false;
                    palavrasDisponiveis.appendChild(palavra);
                }

                botaoResposta.addEventListener("click", removerPalavra);
                botaoResposta.addEventListener("touchstart", removerPalavra, { passive: true });

                // Eventos para arrastar (desktop)
                botaoResposta.addEventListener("dragstart", () => {
                    botaoResposta.classList.add("dragging");
                });

                botaoResposta.addEventListener("dragend", () => {
                    botaoResposta.classList.remove("dragging");
                    atualizarOrdem();
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
        const respostaCorreta = ["Yo", "Leticia", "acepto", "salir", "con", "Cris", "en", "una", "cita", "súper", "romántica"];
        if (JSON.stringify(palavrasSelecionadas) === JSON.stringify(respostaCorreta)) {
            feedback.innerText = "✅ Correto! Parabéns!";
            feedback.style.color = "green";
            popup.style.display = "flex"; // mostra popup
        } else {
            feedback.innerText = "❌ Errado! Tente novamente.";
            feedback.style.color = "red";
        }
    });

    // Fechar popup ao clicar no botão "OK"
    fecharPopupBtn.addEventListener("click", function () {
        popup.style.display = "none";
    });
});
