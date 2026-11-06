import { TAU, clamp, lerp, rnd, rndi, pick, easeOut, drawNineRadial, withAlpha } from "./core";
import { emissive } from "./art";

export function makeBeam(o) {
	return {
		x: 0,
		y: 0,
		angle: 0,
		age: 0,
		duration: .3,
		len: 1200,
		hitX: 0,
		hitY: 0,
		hit: false,
		...o
	};
}
export function makeBullet(o) {
	return {
		x: o.x,
		y: o.y,
		vx: Math.cos(o.a) * o.speed,
		vy: Math.sin(o.a) * o.speed,
		angle: o.a,
		spin: o.spin ?? 0,
		age: 0,
		life: o.life ?? 3,
		size: o.size,
		dead: false,
		kind: o.kind,
		weapon: o.weapon,
		trail: [],
		trailMax: o.trailMax ?? 8,
		data: o.data ?? {},
		noStick: o.noStick,
		update: o.update,
		collide: o.collide,
		draw: o.draw
	};
}
export function trailPath(ctx, b, color, w, alpha = 1) {
	const n = b.trail.length;
	if (n < 2) return;
	ctx.save();
	ctx.globalCompositeOperation = "lighter";
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	const bands = Math.min(4, n - 1);
	for (let band = 0; band < bands; band++) {
		const startIdx = Math.floor(band * (n - 1) / bands);
		const endIdx = Math.floor((band + 1) * (n - 1) / bands);
		if (endIdx <= startIdx) continue;
		const u = (band + .75) / bands;
		ctx.beginPath();
		ctx.moveTo(b.trail[startIdx].x, b.trail[startIdx].y);
		for (let i = startIdx + 1; i <= endIdx; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y);
		ctx.strokeStyle = withAlpha(color, .2 * alpha * u);
		ctx.lineWidth = w * 3 * u;
		ctx.stroke();
		ctx.strokeStyle = withAlpha(color, .65 * alpha * u);
		ctx.lineWidth = w * u;
		ctx.stroke();
	}
	ctx.restore();
}
export function muzzleFlash(api, x, y, a, o) {
	const ps = api.particles;
	const c1 = o.color ?? "#ffd98a";
	const c2 = o.color2 ?? "#ff6a00";
	const S = o.size;
	ps.push(P({
		type: "flash",
		x,
		y,
		size: S * .95,
		color: c1,
		color2: c2,
		life: .075
	}));
	ps.push(P({
		type: "glow",
		x,
		y,
		size: S * 3.4,
		size2: S * 1.4,
		color: c1,
		color2: c2,
		life: .1
	}));
	ps.push(P({
		type: "cone",
		x,
		y,
		rot: a,
		size: S * 2.6,
		width: o.kind === "pistol" ? .3 : .24,
		color: c1,
		color2: c2,
		life: .07
	}));
	const spikes = o.kind === "smg" ? 7 : o.kind === "pistol" ? 5 : 6;
	ps.push(P({
		type: "flare",
		x,
		y,
		rot: a,
		size: S * 2,
		size2: spikes,
		width: o.kind === "smg" ? .9 : .6,
		color: c1,
		life: .075
	}));
	if (o.kind === "ak") {
		ps.push(P({
			type: "cone",
			x,
			y,
			rot: a - .95,
			size: S * 1.3,
			width: .34,
			color: c1,
			color2: c2,
			life: .06
		}));
		ps.push(P({
			type: "cone",
			x,
			y,
			rot: a + .35,
			size: S * .8,
			width: .3,
			color: c1,
			color2: c2,
			life: .05
		}));
	} else if (o.kind === "brake") {
		for (const d of [-1, 1]) ps.push(P({
			type: "cone",
			x: x - Math.cos(a) * 8,
			y: y - Math.sin(a) * 8,
			rot: a + d * 1.45,
			size: S * 1.5,
			width: .3,
			color: c1,
			color2: c2,
			life: .07
		}));
		ps.push(P({
			type: "streak",
			x,
			y,
			rot: a + Math.PI / 2,
			size: S * 1.7,
			width: 5,
			color: c1,
			life: .09
		}));
	}
	ps.push(P({
		type: "shock",
		x: x + Math.cos(a) * 10,
		y: y + Math.sin(a) * 10,
		rot: a + Math.PI / 2,
		size: S * 1.1,
		size2: S * .2,
		color: c1,
		width: 2.4,
		life: .16,
		vx: Math.cos(a) * 160,
		vy: Math.sin(a) * 160,
		drag: .9
	}));
	const nS = o.kind === "brake" ? 16 : 11;
	for (let i = 0; i < nS; i++) {
		const ang = a + rnd(-.7, .7);
		const sp = rnd(280, 1050);
		ps.push(P({
			type: "spark",
			x,
			y,
			vx: Math.cos(ang) * sp,
			vy: Math.sin(ang) * sp,
			color: pick([
				"#fff6d6",
				"#ffc861",
				"#ff9f3a"
			]),
			life: rnd(.1, .38),
			grav: 520,
			drag: .93,
			width: 1.6
		}));
	}
	for (let i = 0; i < 4; i++) {
		const ang = a + rnd(-.5, .5);
		ps.push(P({
			type: "ember",
			x,
			y,
			vx: Math.cos(ang) * rnd(100, 400),
			vy: Math.sin(ang) * rnd(100, 400) - 30,
			size: rnd(1.1, 2.2),
			color: "#ffe3a0",
			color2: "#ff6a00",
			life: rnd(.3, .7),
			grav: 300,
			drag: .95
		}));
	}
	for (let i = 0; i < 6; i++) {
		const ang = a + rnd(-.45, .45);
		ps.push(P({
			type: "smoke",
			x: x + Math.cos(a) * 6,
			y: y + Math.sin(a) * 6,
			vx: Math.cos(ang) * rnd(40, 220),
			vy: Math.sin(ang) * rnd(40, 220) - 28,
			size: rnd(26, 58),
			size2: 5,
			color: i % 2 ? "#aab3bf" : "#8a929e",
			life: rnd(.6, 1.4),
			drag: .93
		}));
	}
}
/** tiny brass casing flung from the ejection port, bounces on the floor */
export function shellEject(api, x, y, o = {}) {
	const pw = o.power ?? 1;
	api.particles.push(P({
		type: "casing",
		x,
		y,
		vx: rnd(90, 210) * pw,
		vy: -rnd(150, 290) * pw,
		size: o.size ?? 4.2,
		rot: rnd(TAU),
		spin: rnd(-26, 26),
		grav: 1500,
		floor: api.floorY,
		bounce: .42,
		life: 1.8,
		drag: .997
	}));
	api.particles.push(P({
		type: "star",
		x,
		y,
		size: 7,
		color: "#fff2c4",
		life: .1,
		width: 1.2
	}));
}
export function energyMuzzle(api, x, y, a, c1, c2, size = 46) {
	const ps = api.particles;
	ps.push(P({
		type: "flash",
		x,
		y,
		size,
		color: c1,
		color2: c2,
		life: .12
	}));
	ps.push(P({
		type: "glow",
		x,
		y,
		size: size * 3,
		size2: size,
		color: c1,
		color2: c2,
		life: .16
	}));
	ps.push(P({
		type: "flare",
		x,
		y,
		rot: a,
		size: size * 2.2,
		size2: 5,
		width: .7,
		color: c1,
		life: .1
	}));
	ps.push(P({
		type: "streak",
		x,
		y,
		rot: a + Math.PI / 2,
		size: size * 1.2,
		width: 3,
		color: c1,
		life: .12
	}));
	ps.push(P({
		type: "ring",
		x,
		y,
		size: size * .95,
		size2: 3,
		color: c1,
		width: 4,
		life: .2
	}));
	for (let i = 0; i < 10; i++) {
		const ang = a + rnd(-.55, .55);
		ps.push(P({
			type: "spark",
			x,
			y,
			vx: Math.cos(ang) * rnd(200, 700),
			vy: Math.sin(ang) * rnd(200, 700),
			color: c1,
			life: rnd(.12, .32),
			drag: .9,
			width: 1.6
		}));
	}
	for (let i = 0; i < 3; i++) ps.push(P({
		type: "bolt",
		x,
		y,
		rot: a + rnd(-.9, .9),
		size: rnd(16, 36),
		color: c1,
		life: .1,
		width: 1.6
	}));
}
export var rimAngleAt = (api, x, y) => Math.atan2(y - api.cy, x - api.cx);
export function splinters(api, x, y, a, n = 12, power = 1) {
	for (let i = 0; i < n; i++) {
		const ang = a + Math.PI + rnd(-1.2, 1.2);
		api.particles.push(P({
			type: "shard",
			x,
			y,
			vx: Math.cos(ang) * rnd(100, 480) * power,
			vy: Math.sin(ang) * rnd(100, 480) * power - 70,
			size: rnd(2.4, 7.5),
			color: pick([
				"#8a5a2b",
				"#a9713a",
				"#6b4320",
				"#c99a62"
			]),
			color2: "#e6bb84",
			rot: rnd(TAU),
			spin: rnd(-22, 22),
			grav: 1150,
			life: rnd(.6, 1.4),
			drag: .99
		}));
	}
}
export function dust(api, x, y, a, n = 5, power = 1, color = "#d9c4a4") {
	for (let i = 0; i < n; i++) {
		const ang = a + Math.PI + rnd(-1, 1);
		api.particles.push(P({
			type: "smoke",
			x,
			y,
			vx: Math.cos(ang) * rnd(50, 200) * power,
			vy: Math.sin(ang) * rnd(50, 200) * power - 25,
			size: rnd(26, 52) * power,
			size2: 5,
			color,
			life: rnd(.45, 1),
			drag: .92
		}));
	}
}
export function shockRing(api, x, y, size, color, width = 3, life = .3) {
	api.particles.push(P({
		type: "ring",
		x,
		y,
		size,
		size2: 4,
		color,
		width,
		life
	}));
}
export function sparkFan(api, x, y, dir, n, o = {}) {
	for (let i = 0; i < n; i++) {
		const ang = dir + rnd(-(o.spread ?? 1.3), o.spread ?? 1.3);
		const sp = rnd(o.min ?? 150, o.max ?? 900);
		const lf = o.life ?? [.15, .5];
		api.particles.push(P({
			type: "spark",
			x,
			y,
			vx: Math.cos(ang) * sp,
			vy: Math.sin(ang) * sp,
			color: pick(o.colors ?? [
				"#fff6d0",
				"#ffcf6b",
				"#ff9b3d"
			]),
			life: rnd(lf[0], lf[1]),
			grav: o.grav ?? 900,
			drag: .93,
			width: o.width ?? 1.9
		}));
	}
}
export function embers(api, x, y, n, c1 = "#ffe3a0", c2 = "#ff5500", power = 1, up = 120) {
	for (let i = 0; i < n; i++) {
		const ang = rnd(TAU);
		api.particles.push(P({
			type: "ember",
			x,
			y,
			vx: Math.cos(ang) * rnd(50, 380) * power,
			vy: Math.sin(ang) * rnd(50, 380) * power - up,
			size: rnd(1.3, 3.1),
			color: c1,
			color2: c2,
			life: rnd(.6, 1.5),
			grav: 260,
			drag: .96
		}));
	}
}
export function impactFlash(api, x, y, size, c1, c2, life = .1) {
	api.particles.push(P({
		type: "flash",
		x,
		y,
		size,
		color: c1,
		color2: c2,
		life
	}));
	api.particles.push(P({
		type: "glow",
		x,
		y,
		size: size * 2.6,
		size2: size * .8,
		color: c1,
		color2: c2,
		life: life * 1.8
	}));
}
/** chain-lightning that crawls along the wheel rim in both directions */
export function rimArcs(api, x, y, color, n = 2, span = 1.3) {
	const a0 = rimAngleAt(api, x, y);
	for (let i = 0; i < n; i++) for (const d of [-1, 1]) api.particles.push(P({
		type: "rimarc",
		x: api.cx,
		y: api.cy,
		rot: a0 + d * .04 * i,
		size: api.wheelR - 1 - i * 3,
		size2: d * span * rnd(.6, 1.15),
		color,
		width: 2.2,
		life: rnd(.24, .4),
		drag: 1
	}));
}
export function radialStreaks(api, x, y, n, color, min = 60, max = 240) {
	for (let i = 0; i < n; i++) {
		const a = i / n * TAU + rnd(-.1, .1);
		api.particles.push(P({
			type: "streak",
			x: x + Math.cos(a) * rnd(8, 30),
			y: y + Math.sin(a) * rnd(8, 30),
			rot: a,
			size: rnd(min, max),
			width: rnd(1.4, 3.2),
			color,
			life: rnd(.15, .32),
			vx: Math.cos(a) * rnd(80, 260),
			vy: Math.sin(a) * rnd(80, 260),
			drag: .9
		}));
	}
}
export function bulletImpact(api, x, y, a, power, color) {
	impactFlash(api, x, y, 30 * power, "#fff2c4", "#ff8a3c", .08);
	sparkFan(api, x, y, a + Math.PI, Math.round(16 * power), {
		spread: 1.35,
		max: 950 * power
	});
	splinters(api, x, y, a, Math.round(9 * power), power);
	dust(api, x, y, a, Math.round(4 * power) + 1, power);
	api.particles.push(P({
		type: "star",
		x,
		y,
		size: 20 * power,
		color,
		life: .12,
		width: 1.6
	}));
	shockRing(api, x, y, 40 * power, "#ffe2b0", 2.6, .24);
}
/** a small, recessed impact dimple; kept compact so its edge never reads as spikes */
export function holeMark(ctx, r, seed, fibers = 8) {
	const R = rng(Math.floor(seed * 1e3) + 7);
	const rx = r * 1.1, ry = r * .84;
	const bruise = ctx.createRadialGradient(-r * .16, -r * .12, r * .08, 0, 0, r * 1.55);
	bruise.addColorStop(0, "rgba(8,4,2,0.94)");
	bruise.addColorStop(.52, "rgba(28,15,7,0.86)");
	bruise.addColorStop(.82, "rgba(86,53,27,0.42)");
	bruise.addColorStop(1, "rgba(86,53,27,0)");
	ctx.fillStyle = bruise;
	ctx.beginPath();
	ctx.ellipse(0, 0, rx * 1.35, ry * 1.35, 0, 0, TAU);
	ctx.fill();
	const rim = ctx.createLinearGradient(0, -ry, 0, ry);
	rim.addColorStop(0, "rgba(244,211,163,0.72)");
	rim.addColorStop(.28, "rgba(113,72,36,0.9)");
	rim.addColorStop(.62, "rgba(28,15,7,1)");
	rim.addColorStop(1, "rgba(119,77,40,0.7)");
	ctx.fillStyle = rim;
	ctx.beginPath();
	ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
	ctx.fill();
	ctx.fillStyle = "#100904";
	ctx.beginPath();
	ctx.ellipse(-r * .04, -r * .02, rx * .62, ry * .56, 0, 0, TAU);
	ctx.fill();
	ctx.strokeStyle = "rgba(255,239,204,0.48)";
	ctx.lineWidth = Math.max(.65, r * .14);
	ctx.beginPath();
	ctx.ellipse(0, 0, rx * .9, ry * .84, 0, Math.PI * 1.08, Math.PI * 1.78);
	ctx.stroke();
	const n = Math.min(4, Math.max(2, Math.ceil(fibers / 5)));
	ctx.lineCap = "round";
	for (let i = 0; i < n; i++) {
		const a = R() * TAU;
		const x0 = Math.cos(a) * rx * .86, y0 = Math.sin(a) * ry * .82;
		const x1 = Math.cos(a + (R() - .5) * .45) * rx * (1.02 + R() * .2), y1 = Math.sin(a + (R() - .5) * .45) * ry * (.98 + R() * .2);
		ctx.strokeStyle = i % 2 ? "rgba(24,12,5,0.72)" : "rgba(232,195,143,0.52)";
		ctx.lineWidth = .65 + R() * .55;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo((x0 + x1) * .56 + (R() - .5) * r * .12, (y0 + y1) * .56);
		ctx.lineTo(x1, y1);
		ctx.stroke();
	}
}
export function crackStar(ctx, seed, n, len, a = .55) {
	const R = rng(Math.floor(seed * 1e3) + 31);
	const count = Math.max(2, Math.min(5, Math.ceil(n / 2.5)));
	const maxLen = Math.max(3, len * .42);
	ctx.lineCap = "round";
	for (let i = 0; i < count; i++) {
		const ang = R() * TAU;
		const l = maxLen * (.42 + R() * .58);
		let x = Math.cos(ang) * len * .12;
		let y = Math.sin(ang) * len * .12;
		const pts = [[x, y]];
		for (let k = 1; k <= 3; k++) {
			const aa = ang + (R() - .5) * .75;
			x += Math.cos(aa) * (l / 3);
			y += Math.sin(aa) * (l / 3);
			pts.push([x, y]);
		}
		ctx.strokeStyle = `rgba(22,12,6,${a})`;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
		ctx.stroke();
		ctx.strokeStyle = "rgba(245,218,180,0.42)";
		ctx.lineWidth = .62;
		ctx.beginPath();
		pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py - .7) : ctx.moveTo(px, py - .7));
		ctx.stroke();
		if (R() > .45) {
			const [bx, by] = pts[2];
			const ba = ang + (R() < .5 ? -1 : 1) * (.5 + R() * .5);
			ctx.strokeStyle = `rgba(22,12,6,${a * .82})`;
			ctx.lineWidth = .9;
			ctx.beginPath();
			ctx.moveTo(bx, by);
			ctx.lineTo(bx + Math.cos(ba) * l * .24, by + Math.sin(ba) * l * .24);
			ctx.stroke();
		}
	}
}
export function heatGlow(ctx, r, color, a, ox = 0) {
	if (a <= .01) return;
	ctx.save();
	ctx.globalCompositeOperation = "lighter";
	drawNineRadial(ctx, ox, 0, r, "#fff3c0", color, a, .4, 1, .7);
	ctx.restore();
}
export function drawEmbedded(ctx, r, hot, color) {
	ctx.beginPath();
	ctx.ellipse(-1, 0, r * 1.15, r, 0, 0, TAU);
	const g = ctx.createRadialGradient(-2, -1, 0, -1, 0, r * 1.2);
	g.addColorStop(0, "#fff0bf");
	g.addColorStop(.5, "#c79637");
	g.addColorStop(1, "#6b4511");
	ctx.fillStyle = g;
	ctx.fill();
	ctx.strokeStyle = "rgba(30,16,4,0.7)";
	ctx.lineWidth = .8;
	ctx.stroke();
	if (hot > .02) emissive(ctx, -1, 0, 10 * hot + 3, color, hot * .6);
}