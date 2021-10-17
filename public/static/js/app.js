ons.ready(()=>{
	fetch("/api/am_i_valid").then((r)=>{
		r.text().then((data)=>{
			if(data=='true'){
				setTimeout(()=>{
					const navigator = document.querySelector('#navigator');
					navigator.resetToPage('/home.html');
				}, 500);
			}
		});
	});
});

const login = () => {
	const modal = document.querySelector('ons-modal');
	modal.show();
	const username = document.querySelector('#username').value;
	const password = document.querySelector('#password').value;

	fetch("/api/auth", { method: "POST", body: `user=${username}&pass=${password}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((r) => {
		if (r.status != 200) {
			ons.notification.alert(`Zła nazwa użytkownika lub hasło! (${r.status})`);
			modal.hide();
			return;
		} else {
			r.text().then((data) => {
				modal.hide();
				document.cookie = `cid=${data};path=/`;
				const navigator = document.querySelector('#navigator');
				navigator.resetToPage('/home.html');
			});
		}
	});

	/*if (username === 'admin' && password === 'tenKiermaszSzkolny123!') {
		const navigator = document.querySelector('#navigator');
		navigator.resetToPage('/home.html');
	} else {
		ons.notification.alert('Wrong username/password combination');
	}*/
}

const openMenu = () => {
	document.querySelector('#menu').open();
};

const loadPage = (page) => {
	document.querySelector('#menu').close();
	document.querySelector('#navigator').bringPageTop(page, { animation: 'fade' });
};

const loadGrades = () => {
	fetch("/api/grades").then((r) => {
		r.json().then((grades) => {
			console.log(grades);
			for (let ci = 0; ci < grades.length; ci++) {
				const c = grades[ci];
				const divId = `#g${c.name.replaceAll(' ', '_')}`;
				//console.log(`${divId}: ${c}`);
				const cDiv = document.querySelector(divId);
				if (!cDiv) {
					continue;
				}
				const semesters = c.semester;
				let innerHTML = ``;
				for (let si = 0; si < semesters.length; si++) {
					const semester = semesters[si];
					innerHTML += `<b>Semestr ${si + 1}</b><br/>`;
					const sgrades = semester.grades;
					if (sgrades.length <= 0) {
						innerHTML += `Brak ocen<br/>`;
						continue;
					}
					for (let sgi = 0; sgi < sgrades.length; sgi++) {
						const sgrade = sgrades[sgi];
						innerHTML += `<ons-button onclick="showGrade(${sgrade.id})">${sgrade.value}</ons-button> `;
					}
					innerHTML += `<br/>`;
				}
				cDiv.innerHTML = innerHTML;
			}
		});
	});
}

const showGrade = (id) => {
	console.log(id);
	const navigator = document.querySelector('#navigator');
	navigator.pushPage("specific-grade.html");
	fetch("/api/grade/" + id).then((r) => {
		r.json().then((grade) => {
			console.log(grade);
			const sgclass = document.querySelector("#specific-grade-class");
			const sginfo = document.querySelector("#specific-grade-info");
			sgclass.innerHTML = grade.lesson;
			sginfo.innerHTML = `<div style="margin-top: 50px;">`;
			sginfo.innerHTML += `<b>Ocena:</b> ${grade.grade}<hr/>`;
			sginfo.innerHTML += `<b>Kategoria:</b> ${grade.category}<hr/>`;
			sginfo.innerHTML += `<b>Komentarz:</b> ${grade.comment}<hr/>`;
			sginfo.innerHTML += `<b>Licz do średniej:</b> ${grade.inAverage ? "Tak" : "Nie"}<hr/>`;
			sginfo.innerHTML += `<b>Waga:</b> ${grade.multiplier ?? 0}<hr/>`;
			sginfo.innerHTML += `<b>Nauczyciel:</b> ${grade.teacher}<hr/>`;
			sginfo.innerHTML += `<b>Data:</b> ${grade.date}<br/>`;
			sginfo.innerHTML += `</div>`;
		});
	});
}

const logout = () => {
	fetch("/api/logout", { method: "POST", body: `cid=${document.cookie.split('=')[1]}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then((r) => {
		document.cookie = "cid=;path=/";
		loadPage("login.html");
	});
}

const loadCalendar = () => {
	fetch("/api/timetable").then((r) => {
		r.json().then((data) => {
			console.log(data);
			for (const ti in data.table) {
				if (Object.hasOwnProperty.call(data.table, ti)) {
					const day = data.table[ti];
					const divDay = document.querySelector(`#c${ti}`);
					divDay.innerHTML = `<hr/>`;
					for (let li = 0; li < day.length; li++) {
						const lesson = day[li];
						divDay.innerHTML += `<b>[${li}] ${data.hours[li]}:</b> ${lesson?.title ?? "-"}<hr/>`;
					}
				}
			}
		});
	});
}