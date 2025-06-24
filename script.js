// 게임 상태 관리
const gameState = {
    player: {
        x: 400,
        y: 250,
        speed: 5
    },
    npcs: {
        mom: { invited: false, x: 100, y: 50 },
        friend: { invited: false, x: 700, y: 50 },
        teacher: { invited: false, x: 100, y: 450 },
        coworker: { invited: false, x: 700, y: 450 }
    },
    totalNpcs: 4,
    invitedCount: 0
};

// DOM 요소들
const player = document.getElementById('player');
const npcs = document.querySelectorAll('.npc');
const progressElement = document.getElementById('progress');
const partyScreen = document.getElementById('party-screen');
const pledgeInput = document.getElementById('pledge-input');
const submitPledgeBtn = document.getElementById('submit-pledge');
const finalResult = document.getElementById('final-result');
const pledgeText = document.getElementById('pledge-text');

// 키보드 상태
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// 게임 초기화
function initGame() {
    updatePlayerPosition();
    updateProgress();
    setupEventListeners();
    startGameLoop();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // 파티 화면 이벤트
    submitPledgeBtn.addEventListener('click', handlePledgeSubmit);
    pledgeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePledgeSubmit();
        }
    });
}

// 키보드 다운 이벤트 처리
function handleKeyDown(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
    
    // 엔터키로 초대장 전달
    if (e.key === 'Enter') {
        e.preventDefault();
        tryInvite();
    }
}

// 키보드 업 이벤트 처리
function handleKeyUp(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
}

// 플레이어 이동 처리
function updatePlayerPosition() {
    // 방향키에 따른 이동
    if (keys.ArrowUp && gameState.player.y > 25) {
        gameState.player.y -= gameState.player.speed;
    }
    if (keys.ArrowDown && gameState.player.y < 475) {
        gameState.player.y += gameState.player.speed;
    }
    if (keys.ArrowLeft && gameState.player.x > 25) {
        gameState.player.x -= gameState.player.speed;
    }
    if (keys.ArrowRight && gameState.player.x < 775) {
        gameState.player.x += gameState.player.speed;
    }
    
    // 플레이어 위치 업데이트
    player.style.left = gameState.player.x + 'px';
    player.style.top = gameState.player.y + 'px';
}

// 충돌 감지
function checkCollision(playerRect, npcRect) {
    return !(playerRect.right < npcRect.left || 
             playerRect.left > npcRect.right || 
             playerRect.bottom < npcRect.top || 
             playerRect.top > npcRect.bottom);
}

// 초대장 전달 시도
function tryInvite() {
    const playerRect = player.getBoundingClientRect();
    
    npcs.forEach(npc => {
        const npcId = npc.dataset.npc;
        const npcState = gameState.npcs[npcId];
        
        if (!npcState.invited) {
            const npcRect = npc.getBoundingClientRect();
            
            if (checkCollision(playerRect, npcRect)) {
                inviteNpc(npcId, npc);
            }
        }
    });
}

// NPC 초대 처리
function inviteNpc(npcId, npcElement) {
    gameState.npcs[npcId].invited = true;
    gameState.invitedCount++;
    
    // 시각적 피드백
    npcElement.classList.add('invited');
    
    // 축하 메시지 표시
    showCongratulations(npcId);
    
    // 진행 상황 업데이트
    updateProgress();
    
    // 모든 NPC 초대 완료 확인
    if (gameState.invitedCount >= gameState.totalNpcs) {
        setTimeout(() => {
            showPartyScreen();
        }, 1000);
    }
}

// 축하 메시지 표시
function showCongratulations(npcId) {
    const messages = {
        mom: "부모님이 축하해주세요! 🎉",
        friend: "친구가 축하해주세요! 🎉",
        teacher: "선생님이 축하해주세요! 🎉",
        coworker: "동기가 축하해주세요! 🎉"
    };
    
    const message = messages[npcId];
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 107, 107, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 1.2em;
        font-weight: bold;
        z-index: 100;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.querySelector('.game-area').appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// 진행 상황 업데이트
function updateProgress() {
    progressElement.textContent = `${gameState.invitedCount}/${gameState.totalNpcs}`;
}

// 파티 화면 표시
function showPartyScreen() {
    partyScreen.classList.remove('hidden');
    
    // 효과음 재생 (선택사항)
    playPartySound();
}

// 파티 효과음 재생
function playPartySound() {
    // 간단한 오디오 효과 (브라우저 API 사용)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('오디오 재생을 지원하지 않는 브라우저입니다.');
    }
}

// 다짐 제출 처리
function handlePledgeSubmit() {
    const pledge = pledgeInput.value.trim();
    
    if (pledge) {
        pledgeText.textContent = pledge;
        finalResult.classList.remove('hidden');
        submitPledgeBtn.style.display = 'none';
        pledgeInput.disabled = true;
        
        // 축하 애니메이션
        finalResult.style.animation = 'partyEntrance 0.5s ease-out';
    } else {
        alert('다짐을 입력해주세요!');
    }
}

// 게임 루프
function startGameLoop() {
    function gameLoop() {
        updatePlayerPosition();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);

// 게임 시작
document.addEventListener('DOMContentLoaded', initGame); 