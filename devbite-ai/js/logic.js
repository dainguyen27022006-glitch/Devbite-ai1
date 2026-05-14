// ===== INTENTS =====

const intents = {
    battery: ["pin", "trâu"],
    price: ["giá", "rẻ", "bao nhiêu"],
    compare: ["so sánh", "vs", "với", "và"]
};

// ===== ADD MESSAGE =====

function addMessage(sender, text){

    const chatBox =
    document.getElementById("chatBox");

    const message =
    document.createElement("div");

    message.classList.add("message");

    if(sender === "user"){

        message.classList.add(
            "user-message"
        );

        message.innerHTML = text;

    }else{

        message.classList.add(
            "bot-message"
        );

        typeText(message, text);
    }

    chatBox.appendChild(message);

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// ===== TYPE EFFECT =====

function typeText(element, text){

    let index = 0;

    let speed = 12;

    function typing(){

        if(index < text.length){

            element.innerHTML =
            text.slice(0, index + 1);

            index++;

            const chatBox =
            document.getElementById("chatBox");

            chatBox.scrollTop =
            chatBox.scrollHeight;

            setTimeout(typing, speed);
        }
    }

    typing();
}

// ===== THINKING =====

function addThinking(){

    const chatBox =
    document.getElementById("chatBox");

    const thinking =
    document.createElement("div");

    thinking.classList.add("thinking");

    thinking.id = "thinking";

    thinking.innerHTML =
    "TechVibe AI đang phân tích";

    chatBox.appendChild(thinking);

    let dots = 0;

    const interval =
    setInterval(() => {

        dots++;

        if(dots > 3){
            dots = 0;
        }

        thinking.innerHTML =
        "TechVibe AI đang phân tích" +
        ".".repeat(dots);

    }, 400);

    thinking.dataset.interval =
    interval;

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// ===== TYPING =====

function showTyping(){

    const chatBox =
    document.getElementById("chatBox");

    const typing =
    document.createElement("div");

    typing.classList.add("typing");

    typing.id = "typing";

    typing.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatBox.appendChild(typing);

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// ===== REMOVE =====

function removeTyping(){

    const typing =
    document.getElementById("typing");

    if(typing){
        typing.remove();
    }

    const thinking =
    document.getElementById("thinking");

    if(thinking){

        clearInterval(
            thinking.dataset.interval
        );

        thinking.remove();
    }
}

// ===== DETECT =====

function detectIntent(text){

    text = text.toLowerCase();

    for(let key in intents){

        for(let word of intents[key]){

            if(text.includes(word)){

                return key;
            }
        }
    }

    return "unknown";
}

// ===== FIND PRODUCT =====

function findProduct(text){

    text = text.toLowerCase();

    return products.find(p =>
        text.includes(
            p.name.toLowerCase()
        )
    );
}

// ===== FORMAT =====

function formatProducts(list){

    return list.map(p => `

        📱 <b>${p.name}</b><br>

        💰 ${p.price.toLocaleString()}đ<br>

        🔋 Pin ${p.battery}mAh

    `).join("<br><br>");
}

// ===== HANDLE =====

function handleIntent(intent, text){

    // ===== BATTERY =====

    if(intent === "battery"){

        let result =
        products.filter(
            p => p.battery >= 4000
        );

        return `

            🔋 <b>Đây là những mẫu pin trâu nổi bật hiện nay:</b>

            <br><br>

            ${formatProducts(result)}

            <br><br>

            🤖 Những sản phẩm này sẽ phù hợp nếu bạn thường xuyên chơi game, xem phim hoặc cần sử dụng cả ngày dài.
        `;
    }

    // ===== PRICE =====

    if(intent === "price"){

        return `
            💰 Bạn hãy nhập mức giá cụ thể nhé.
        `;
    }

    // ===== COMPARE =====

    if(intent === "compare"){

        let parts =
        text.split(/vs|với|và/);

        if(parts.length >= 2){

            let p1 =
            findProduct(parts[0]);

            let p2 =
            findProduct(parts[1]);

            if(p1 && p2){

                let analysis = "";

                // ===== SO GIÁ =====

                if(p1.price > p2.price){

                    analysis += `

                    💰 ${p1.name} có mức giá cao hơn, đổi lại trải nghiệm và hiệu năng thường sẽ tốt hơn.

                    <br><br>
                    `;

                }else{

                    analysis += `

                    💸 ${p2.name} có giá dễ tiếp cận hơn với người dùng phổ thông.

                    <br><br>
                    `;
                }

                // ===== SO PIN =====

                if(p1.battery > p2.battery){

                    analysis += `

                    🔋 ${p1.name} có dung lượng pin tốt hơn, phù hợp chơi game hoặc sử dụng lâu dài.

                    <br><br>
                    `;

                }else{

                    analysis += `

                    🔋 ${p2.name} có lợi thế về thời lượng pin và khả năng sử dụng liên tục.

                    <br><br>
                    `;
                }

                // ===== KẾT LUẬN =====

                analysis += `

                🤖 <b>Kết luận:</b>

                <br><br>

                👉 Nếu bạn thích hiệu năng, camera và trải nghiệm cao cấp hơn thì
                <b>${p1.price > p2.price ? p1.name : p2.name}</b>
                sẽ phù hợp hơn.

                <br><br>

                👉 Nếu bạn cần một sản phẩm tiết kiệm, ổn định và pin tốt thì
                <b>${p1.price < p2.price ? p1.name : p2.name}</b>
                là lựa chọn hợp lý hơn.
                `;

                return `

                    ⚔️ <b>So sánh nhanh cho bạn:</b>

                    <br><br>

                    📱 <b>${p1.name}</b><br>
                    💰 ${p1.price.toLocaleString()}đ<br>
                    🔋 ${p1.battery}mAh

                    <br><br>

                    📱 <b>${p2.name}</b><br>
                    💰 ${p2.price.toLocaleString()}đ<br>
                    🔋 ${p2.battery}mAh

                    <br><br>

                    ${analysis}
                `;
            }
        }

        return `
            🤔 Bạn muốn so sánh sản phẩm nào?
        `;
    }

    return `

        🤖 Mình chưa hiểu lắm.

        <br><br>

        👉 Bạn có thể hỏi về:
        <br>
        • điện thoại pin trâu
        <br>
        • giá điện thoại
        <br>
        • so sánh sản phẩm
    `;
}

// ===== SEND =====

function sendMessage(){

    const input =
    document.getElementById("userInput");

    const text =
    input.value.trim();

    if(text === "") return;

    addMessage("user", text);

    input.value = "";

    addThinking();

    showTyping();

    setTimeout(() => {

        removeTyping();

        const intent =
        detectIntent(text);

        const reply =
        handleIntent(intent, text);

        addMessage("bot", reply);

    }, 1600);
}

// ===== ENTER =====

document
.getElementById("userInput")
.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        sendMessage();
    }
});

// ===== BUTTON =====

document
.getElementById("sendBtn")
.addEventListener("click", sendMessage);
function quickAsk(text){

    document
    .getElementById("userInput")
    .value = text;

    sendMessage();
}