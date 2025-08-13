// Keeps the user-portal login panel centered even if other CSS/scripts try to move it
(function(){
	function enforce() {
		var screen = document.getElementById('loginScreen');
		if (!screen) return;
		screen.style.setProperty('display','flex','important');
		screen.style.setProperty('justify-content','center','important');
		screen.style.setProperty('align-items','center','important');
		var container = screen.querySelector('.login-container');
		if (container) {
			container.style.setProperty('margin','0 auto','important');
			container.style.setProperty('position','relative','important');
			['left','right','top','bottom','transform','float'].forEach(function(p){
				container.style.setProperty(p, p==='float' ? 'none' : (p==='transform' ? 'none' : 'auto'),'important');
			});
		}
		var form = screen.querySelector('.login-form');
		if (form) {
			form.style.setProperty('position','static','important');
			form.style.setProperty('margin','0','important');
			form.style.setProperty('width','100%','important');
			['left','right','transform'].forEach(function(p){
				form.style.setProperty(p, p==='transform' ? 'none' : 'auto','important');
			});
		}
	}
	var intervalId;
	function start() {
		enforce();
		if (!intervalId) intervalId = setInterval(enforce, 150);
		var screen = document.getElementById('loginScreen');
		if (screen) {
			new MutationObserver(enforce).observe(screen,{attributes:true,childList:true,subtree:true});
		}
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start);
	} else { start(); }
	window.addEventListener('load', enforce);
})();
