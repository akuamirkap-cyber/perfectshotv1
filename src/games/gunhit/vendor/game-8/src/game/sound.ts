export class SoundEngine {
	ac = null;
	master;
	fxBus;
	musicBus;
	rev;
	revG;
	nb;
	muted = false;
	musicOn = true;
	loops = /* @__PURE__ */ new Map();
	/** Only callbacks that have not fired yet; completed IDs must not accumulate. */
	timers = /* @__PURE__ */ new Set();
	disposed = false;
	lastAt = /* @__PURE__ */ new Map();
	mTimer;
	nextStep = 0;
	step = 0;
	constructor() {
		try {
			this.muted = localStorage.getItem("arsenal-mute") === "1";
			this.musicOn = localStorage.getItem("arsenal-music") !== "0";
		} catch {}
	}
	ensure() {
		if (this.disposed) return false;
		if (this.ac) return true;
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return false;
		const ac = this.ac = new AC();
		const comp = ac.createDynamicsCompressor();
		comp.threshold.value = -10;
		comp.knee.value = 12;
		comp.ratio.value = 4.5;
		comp.attack.value = .006;
		comp.release.value = .15;
		this.master = ac.createGain();
		this.master.gain.value = this.muted ? 0 : .94;
		this.fxBus = ac.createGain();
		this.fxBus.gain.value = 1;
		this.musicBus = ac.createGain();
		this.musicBus.gain.value = .62;
		this.fxBus.connect(comp);
		this.musicBus.connect(comp);
		comp.connect(this.master);
		this.master.connect(ac.destination);
		const sr = ac.sampleRate, len = Math.max(1, Math.floor(sr * 1.15));
		const ir = ac.createBuffer(2, len, sr);
		for (let c = 0; c < 2; c++) {
			const d = ir.getChannelData(c);
			let smooth = 0;
			for (let i = 0; i < len; i++) {
				const raw = Math.random() * 2 - 1;
				smooth = smooth * .4 + raw * .6;
				d[i] = smooth * Math.pow(1 - i / len, 2.8) * .6;
			}
		}
		this.rev = ac.createConvolver();
		this.rev.normalize = true;
		this.rev.buffer = ir;
		this.revG = ac.createGain();
		this.revG.gain.value = .3;
		this.rev.connect(this.revG);
		this.revG.connect(comp);
		const send = ac.createGain();
		send.gain.value = .45;
		this.fxBus.connect(send);
		send.connect(this.rev);
		const n = ac.sampleRate * 2;
		this.nb = ac.createBuffer(1, n, ac.sampleRate);
		const nd = this.nb.getChannelData(0);
		for (let i = 0; i < n; i++) nd[i] = Math.random() * 2 - 1;
		return true;
	}
	unlock() {
		if (!this.ensure()) return;
		const ac = this.ac;
		if (ac.state === "suspended") ac.resume();
		if (this.musicOn && this.mTimer === void 0) this.startMusic();
	}
	toggleMute() {
		this.muted = !this.muted;
		try {
			localStorage.setItem("arsenal-mute", this.muted ? "1" : "0");
		} catch {}
		if (this.ac) this.master.gain.linearRampToValueAtTime(this.muted ? 0 : .92, this.ac.currentTime + .08);
		return this.muted;
	}
	toggleMusic() {
		this.musicOn = !this.musicOn;
		try {
			localStorage.setItem("arsenal-music", this.musicOn ? "1" : "0");
		} catch {}
		if (this.musicOn) {
			this.unlock();
			if (this.mTimer === void 0) this.startMusic();
		} else {
			clearInterval(this.mTimer);
			this.mTimer = void 0;
		}
		return this.musicOn;
	}
	stopAll() {
		for (const l of this.loops.values()) l.stop();
		this.loops.clear();
		for (const t of this.timers) clearTimeout(t);
		this.timers.clear();
	}
	/** Release the per-game graph when its owning game is destroyed. */
	dispose() {
		if (this.disposed) return;
		this.disposed = true;
		this.stopAll();
		if (this.mTimer !== void 0) clearInterval(this.mTimer);
		this.mTimer = void 0;
		this.lastAt.clear();
		const ac = this.ac;
		this.ac = null;
		if (ac && ac.state !== "closed") try {
			ac.close().catch(() => {});
		} catch {}
	}
	t0() {
		return this.ac ? this.ac.currentTime + .012 : 0;
	}
	ready() {
		if (!this.ac || this.muted) return false;
		if (this.ac.state === "suspended") try {
			this.ac.resume();
		} catch {}
		return true;
	}
	/** gain stage w/ ADSR-lite, connected to fxBus (and thus reverb) */
	osc(type, f0, f1, dur, peak, a = .004, when = 0, pan = 0) {
		const ac = this.ac;
		const t = this.t0() + when;
		const o = ac.createOscillator();
		o.type = type;
		o.frequency.setValueAtTime(Math.max(20, f0), t);
		if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
		let node = o;
		if (pan) {
			const p = ac.createStereoPanner();
			p.pan.value = pan;
			o.connect(p);
			node = p;
		}
		const g = ac.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.linearRampToValueAtTime(peak, t + a);
		g.gain.exponentialRampToValueAtTime(2e-4, t + a + dur);
		node.connect(g);
		g.connect(this.fxBus);
		o.start(t);
		o.stop(t + a + dur + .05);
		o.onended = () => {
			o.disconnect();
			g.disconnect();
		};
		return o;
	}
	noise(dur, peak, o = {}) {
		const ac = this.ac;
		const t = this.t0() + (o.when ?? 0);
		const src = ac.createBufferSource();
		src.buffer = this.nb;
		src.loop = true;
		src.playbackRate.value = o.rate ?? 1;
		let node = src;
		if (o.hp || o.lp) {
			const f = ac.createBiquadFilter();
			f.type = o.hp && o.lp ? "bandpass" : o.hp ? "highpass" : "lowpass";
			f.frequency.setValueAtTime(o.hp || o.lp, t);
			if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + dur);
			f.Q.value = o.q ?? (o.hp && o.lp ? 1.1 : .7);
			src.connect(f);
			node = f;
		}
		if (o.pan) {
			const p = ac.createStereoPanner();
			p.pan.value = o.pan;
			node.connect(p);
			node = p;
		}
		const g = ac.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.linearRampToValueAtTime(peak, t + (o.a ?? .004));
		g.gain.exponentialRampToValueAtTime(2e-4, t + (o.a ?? .004) + dur);
		node.connect(g);
		g.connect(this.fxBus);
		src.start(t);
		src.stop(t + (o.a ?? .004) + dur + .05);
		src.onended = () => {
			src.disconnect();
			g.disconnect();
		};
	}
	boom(size = 1, tone = "boom") {
		this.osc("sine", 62, 30, .5 * size, .85 * size, .004);
		this.noise(.45 * size, .6 * size, {
			lp: 340,
			a: .005
		});
		if (tone === "zap") {
			this.osc("sawtooth", 900, 120, .16, .16);
			this.noise(.3, .25, { hp: 2600 });
		}
		if (tone === "solar") {
			this.noise(.8, .4, { lp: 260 });
			this.osc("sine", 1300, 500, .35, .08);
		}
	}
	woodHit(p) {
		const v = Math.min(1.2, .45 + .4 * p);
		this.noise(.09, .9 * v, { lp: 260 });
		this.osc("square", 150, 70, .05, .2 * v);
		this.noise(.03, .4 * v, { hp: 2800 });
	}
	crackle(n, when = 0, vol = .3, hp = 2200) {
		for (let i = 0; i < n; i++) this.noise(.02 + Math.random() * .05, vol * (.4 + Math.random() * .6), {
			hp: hp * (.7 + Math.random() * .8),
			when: when + Math.random() * .35,
			pan: Math.random() * 1.6 - .8
		});
	}
	chimes(n = 3, scale = [
		1046,
		1318,
		1568,
		2093
	], when = 0) {
		for (let i = 0; i < n; i++) {
			const f = scale[Math.floor(Math.random() * scale.length)] * (.97 + Math.random() * .06);
			this.osc("sine", f, f, .5 + Math.random() * .4, .12, .004, when + i * .07 + Math.random() * .05, Math.random() * 1.4 - .7);
		}
	}
	splinters(n, vol = .2) {
		for (let i = 0; i < n; i++) this.noise(.015 + Math.random() * .03, vol * (.5 + Math.random() * .5), {
			hp: 3e3 + Math.random() * 4e3,
			when: Math.random() * .28,
			pan: Math.random() * 1.6 - .8
		});
	}
	gate(fam, ms) {
		const now = performance.now();
		if (now - (this.lastAt.get(fam) ?? -1e9) < ms) return false;
		this.lastAt.set(fam, now);
		return true;
	}
	later(ms, fn) {
		if (this.disposed) return;
		const timer = window.setTimeout(() => {
			this.timers.delete(timer);
			fn();
		}, ms);
		this.timers.add(timer);
	}
	playFire(id) {
		if (!this.ready()) return;
		const v = (mul = 1) => mul;
		switch (id) {
			case "ak47":
				this.noise(.1, .95 * v(), { hp: 1100 });
				this.osc("sine", 115, 42, .11, .5);
				this.osc("square", 240, 80, .03, .16);
				break;
			case "mp5":
				this.noise(.07, .8, { hp: 1600 });
				this.osc("sine", 150, 60, .08, .4);
				break;
			case "mp5-electro":
				this.noise(.07, .7, { hp: 1500 });
				this.osc("sawtooth", 980, 140, .07, .2);
				this.noise(.05, .3, { hp: 3200 });
				break;
			case "rifle":
				this.noise(.09, 1, { hp: 1900 });
				this.osc("square", 260, 90, .045, .2);
				this.osc("sine", 130, 50, .1, .45);
				break;
			case "rifle-electro":
				this.noise(.08, .9, { hp: 1800 });
				this.osc("sawtooth", 1300, 160, .12, .22);
				this.noise(.08, .35, { hp: 3400 });
				break;
			case "beretta":
				this.noise(.08, 1.05, { hp: 1400 });
				this.osc("sine", 150, 46, .12, .55);
				this.osc("sine", 3100, 2600, .05, .12, .001, .016);
				this.noise(.04, .3, {
					hp: 5200,
					when: .014
				});
				break;
			case "sniper-beam":
				this.osc("sawtooth", 200, 1500, .16, .18, .01);
				this.boom(1.15, "zap");
				this.noise(.5, .5, {
					hp: 300,
					sweepTo: 2600
				});
				this.osc("sine", 7800, 5200, .5, .07, .004, .02);
				break;
			case "bow":
				this.osc("sine", 380, 130, .12, .4);
				this.osc("sine", 570, 190, .1, .25);
				this.noise(.2, .3, {
					hp: 1500,
					sweepTo: 3200
				});
				break;
			case "energy-sword":
				this.noise(.26, .5, {
					hp: 380,
					lp: 1900,
					sweepTo: 2400,
					q: 3
				});
				this.osc("sawtooth", 90, 220, .16, .1);
				break;
			case "plasmacaster":
			case "plasmacaster-mk2":
				if (!this.gate("plasma", 300)) break;
				this.osc("sawtooth", 70, 190, .26, .22);
				this.boom(1.25, "zap");
				this.crackle(8, .12, .3);
				break;
			case "identity-disc":
				this.noise(.3, .4, {
					hp: 500,
					lp: 2300,
					sweepTo: 2400,
					q: 2
				});
				this.osc("sine", 320, 940, .28, .14);
				break;
			case "singularity":
				this.osc("sine", 66, 26, .9, .8);
				this.noise(.5, .35, {
					hp: 320,
					sweepTo: 2800
				});
				this.osc("sawtooth", 220, 34, .55, .2);
				break;
			case "prism-lance":
				this.chimes(4, [
					1600,
					2400,
					3200,
					4200
				]);
				this.noise(.32, .34, { hp: 3600 });
				this.osc("triangle", 2400, 900, .22, .22, .004);
				break;
			case "nano-swarm":
				for (let i = 0; i < 5; i++) this.osc("square", 720 + i * 190, 720 + i * 190, .03, .2, .002, i * .028);
				this.noise(.2, .3, { hp: 2400 });
				this.osc("sawtooth", 1400, 300, .16, .14, .004, .02);
				break;
			case "chrono":
				this.noise(.38, .26, {
					hp: 2800,
					sweepTo: 420,
					q: 2
				});
				this.osc("sine", 66, 30, .5, .5);
				for (let i = 0; i < 2; i++) this.osc("square", 1900, 1200, .03, .1, .002, .1 + i * .09);
				break;
			case "orbital-beacon":
				for (let i = 0; i < 2; i++) this.osc("square", 1380, 1380, .05, .12, .002, i * .09);
				this.noise(.5, .4, {
					hp: 420,
					lp: 2800,
					sweepTo: 2600,
					q: 2
				});
				break;
			case "helix-pulsar":
				this.osc("square", 720, 240, .05, .34);
				this.osc("sawtooth", 1080, 360, .05, .3, .002, .016);
				this.noise(.06, .18, { hp: 2200 });
				break;
			case "harmonic":
				this.osc("sine", 55, 28, .75, 1);
				this.noise(.4, .5, { lp: 260 });
				this.osc("sine", 2500, 260, .85, .13, .01, .04);
				break;
			case "absolute-zero":
				this.noise(.45, .45, {
					hp: 1700,
					sweepTo: 600,
					q: 1.2
				});
				this.noise(.3, .3, { lp: 380 });
				this.chimes(2, [
					2800,
					4200,
					5600
				], .05);
				break;
			case "helios":
				this.noise(.5, .7, {
					hp: 300,
					lp: 1400,
					sweepTo: 500
				});
				this.osc("sine", 60, 30, .65, .9);
				this.noise(1.1, .34, {
					lp: 300,
					when: .05
				});
				break;
			case "xenomorph":
				this.noise(.16, .7, {
					lp: 480,
					q: 2
				});
				this.osc("sine", 230, 80, .1, .3);
				this.noise(.1, .3, {
					hp: 1100,
					when: .02
				});
				break;
			case "tripod":
				this.osc("sawtooth", 180, 1400, .3, .3, .02);
				this.osc("square", 90, 620, .26, .18, .02, .01);
				this.noise(.34, .4, {
					hp: 1500,
					sweepTo: 5200,
					q: 1.4
				});
				this.noise(.22, .2, {
					lp: 500,
					when: .12
				});
				break;
			case "ironman":
				this.boom(.9, "zap");
				this.osc("sine", 320, 60, .3, .6, .004);
				this.noise(.5, .4, {
					hp: 900,
					sweepTo: 2600,
					when: .02
				});
				break;
			case "mega-buster":
				this.osc("square", 1500, 520, .09, .42);
				this.osc("sawtooth", 420, 140, .16, .22, .004);
				this.noise(.12, .4, {
					hp: 2600,
					when: .01
				});
				break;
			case "dragon-breath":
				this.noise(.55, .6, {
					lp: 420,
					sweepTo: 1600,
					q: 1.6
				});
				this.osc("sawtooth", 78, 34, .5, .5, .01);
				this.crackle(10, .06, .32);
				this.noise(.9, .28, {
					lp: 300,
					when: .08
				});
				break;
			case "proton-pack":
				this.osc("sawtooth", 150, 210, .4, .34, .01);
				this.osc("sawtooth", 158, 224, .4, .3, .01, .012);
				this.noise(.45, .34, {
					hp: 1200,
					sweepTo: 3e3,
					q: 1.2
				});
				this.crackle(7, .04, .26, 2800);
				break;
			case "phaser":
				this.osc("sine", 2400, 320, .26, .42);
				this.osc("square", 1200, 210, .18, .16, .004);
				this.noise(.2, .24, {
					hp: 3e3,
					sweepTo: 800,
					q: 2
				});
				break;
			default:
				this.noise(.07, .7, { hp: 1300 });
				this.osc("sine", 130, 55, .09, .4);
		}
	}
	playRelease(id, c) {
		if (!this.ready()) return;
		const ch = this.loops.get("charge");
		if (ch) {
			ch.stop();
			this.loops.delete("charge");
		}
		if (id === "mega-buster") {
			if (c < .45) {
				this.osc("square", 1500, 640, .07, .3);
				this.noise(.03, .2, { hp: 3e3 });
			} else if (c < 1.2) {
				this.osc("sawtooth", 320, 1500, .16, .28, .006);
				this.osc("square", 1240, 500, .08, .18, .004, .1);
				this.noise(.14, .3, {
					hp: 2200,
					when: .02
				});
			} else {
				this.osc("sawtooth", 420, 1900, .2, .3, .005);
				this.boom(1.2, "zap");
				this.noise(.3, .4, {
					hp: 2e3,
					when: .05
				});
			}
		}
	}
	/** wood-hit — rate-limited, scales with power */
	thunk(power) {
		if (!this.ready() || !this.gate("thunk", 52)) return;
		this.woodHit(Math.min(2.6, power));
	}
	ricochet() {
		if (!this.ready()) return;
		this.osc("sine", 3400, 2500, .24, .2);
		this.osc("sine", 5100, 4200, .15, .1, .002, .01);
		this.noise(.05, .35, { hp: 4200 });
		this.woodHit(.5);
	}
	breakWheel() {
		if (!this.ready()) return;
		this.noise(.5, 1, { lp: 320 });
		this.osc("square", 120, 50, .14, .5);
		this.osc("sine", 52, 28, .75, 1);
		this.splinters(10, .3);
		this.noise(.7, .3, {
			hp: 600,
			lp: 3e3,
			when: .04
		});
	}
	levelClear() {
		if (!this.ready()) return;
		[
			523,
			659,
			784,
			880,
			1046,
			1318
		].forEach((f, i) => {
			this.osc("triangle", f, f, .3, .3, .004, i * .075, i % 2 ? .5 : -.5);
			if (i >= 4) this.osc("sine", f * 2, f * 2, .4, .12, .004, i * .075);
		});
		[
			523,
			659,
			784
		].forEach((f) => this.osc("sine", f, f, .9, .16, .01, .48));
		this.noise(.9, .1, {
			hp: 8e3,
			when: .35
		});
	}
	select() {
		if (!this.ready()) return;
		this.osc("square", 860, 1200, .05, .1);
		this.noise(.12, .12, { hp: 2400 });
	}
	impact(id) {
		if (!this.ready() || !this.gate("imp" + id, 60)) return;
		switch (id) {
			case "ak47":
			case "rifle":
			case "mp5":
			case "beretta":
			case "rifle-electro":
			case "mp5-electro":
				this.osc("square", 210, 90, .025, .2);
				this.noise(.04, .35, { hp: 2600 });
				this.crackle(2, .01, .18, 3e3);
				break;
			case "sniper-beam":
			case "plasmacaster":
			case "plasmacaster-mk2":
			case "helios":
				this.boom(.95);
				this.crackle(6, .06, .3);
				if (id === "helios") {
					this.noise(.9, .4, { lp: 280 });
					this.crackle(8, .2, .3, 2800);
				}
				break;
			case "bow":
				this.noise(.1, .9, { lp: 240 });
				this.osc("square", 170, 80, .05, .3);
				break;
			case "energy-sword":
				this.noise(.18, .5, { hp: 2e3 });
				this.osc("sawtooth", 1100, 180, .14, .2);
				break;
			case "identity-disc":
				this.osc("square", 480, 120, .12, .2);
				this.osc("square", 960, 300, .1, .1, .004, .03);
				this.noise(.16, .3, { hp: 1600 });
				break;
			case "singularity":
				this.noise(.85, .5, {
					hp: 900,
					lp: 3e3,
					sweepTo: 200,
					q: 2
				});
				this.osc("sine", 36, 24, 1.1, 1);
				this.later(1010, () => {
					if (this.ready()) {
						this.boom(1.5, "zap");
						this.crackle(9, .1, .4);
					}
				});
				break;
			case "prism-lance":
				this.chimes(2, [
					1300,
					1950,
					2600,
					3900
				]);
				this.noise(.1, .2, { hp: 4200 });
				break;
			case "nano-swarm":
				for (let i = 0; i < 4; i++) this.osc("square", 900 + Math.random() * 1400, 900, .025, .1, .002, i * .04, Math.random() - .5);
				this.noise(.06, .2, { hp: 3e3 });
				break;
			case "chrono":
				this.osc("sine", 1600, 1600, .6, .14);
				this.osc("sine", 2400, 2400, .6, .08, .004, .06);
				this.osc("sine", 66, 30, .5, .6);
				this.noise(.4, .2, {
					hp: 3600,
					sweepTo: 800,
					q: 2,
					when: .02
				});
				break;
			case "orbital-beacon":
				this.osc("square", 620, 1800, .85, .13, .004, .02);
				this.osc("square", 930, 2700, .85, .1, .004, .06);
				this.later(940, () => {
					if (!this.ready()) return;
					this.boom(1.7, "zap");
					this.noise(.7, .5, {
						hp: 200,
						lp: 1600,
						sweepTo: 400
					});
					this.crackle(10, .15, .4);
					this.noise(.8, .4, {
						lp: 240,
						when: .05
					});
				});
				break;
			case "helix-pulsar":
				this.osc("square", 860, 300, .05, .15);
				this.noise(.04, .25, { hp: 2600 });
				break;
			case "harmonic":
				this.osc("sine", 48, 26, .8, .9);
				this.noise(.35, .4, { lp: 300 });
				this.later(380, () => {
					if (this.ready()) {
						this.noise(.4, .6, { lp: 260 });
						this.osc("sine", 52, 28, .5, .7);
						this.crackle(6, .02, .35);
					}
				});
				break;
			case "absolute-zero":
				this.noise(.3, .5, { hp: 2600 });
				this.crackle(7, .02, .4, 3600);
				for (let i = 0; i < 3; i++) this.osc("sine", 4200 - i * 700, 3e3 - i * 500, .25, .1, .002, i * .05, Math.random() - .5);
				break;
			case "xenomorph":
				this.noise(.2, .6, {
					lp: 600,
					q: 2
				});
				this.noise(1.6, .3, {
					hp: 2800,
					q: 1.5
				});
				for (let i = 0; i < 5; i++) this.osc("sine", 300 + Math.random() * 300, 120, .06, .12, .004, .1 + Math.random() * .9, Math.random() - .5);
				break;
			case "mega-buster":
				this.noise(.3, .5, { hp: 1600 });
				this.osc("square", 300, 90, .09, .3);
				this.noise(.12, .3, {
					hp: 3400,
					when: .02
				});
				break;
			default: this.woodHit(.9);
		}
	}
	startLoop(id) {
		const ac = this.ac;
		const g = ac.createGain();
		g.gain.value = 1e-4;
		g.connect(this.fxBus);
		const nodes = [];
		const osc = (type, f) => {
			const o = ac.createOscillator();
			o.type = type;
			o.frequency.value = f;
			nodes.push(o);
			return o;
		};
		const noiseBB = () => {
			const s = ac.createBufferSource();
			s.buffer = this.nb;
			s.loop = true;
			nodes.push(s);
			return s;
		};
		const lfo = (f, depth, target) => {
			const o = ac.createOscillator();
			o.frequency.value = f;
			const og = ac.createGain();
			og.gain.value = depth;
			o.connect(og);
			og.connect(target);
			o.start();
			nodes.push(o);
		};
		let extra = () => {};
		switch (id) {
			case "dragon-breath": {
				const n = noiseBB();
				const f = ac.createBiquadFilter();
				f.type = "lowpass";
				f.frequency.value = 320;
				f.Q.value = 1.2;
				const n2 = noiseBB();
				const f2 = ac.createBiquadFilter();
				f2.type = "bandpass";
				f2.frequency.value = 1800;
				f2.Q.value = .8;
				const g2 = ac.createGain();
				g2.gain.value = .4;
				const sub = osc("sine", 48);
				const sg = ac.createGain();
				sg.gain.value = .5;
				lfo(7, 120, f.frequency);
				lfo(9, 700, f2.frequency);
				n.connect(f);
				f.connect(g);
				n2.connect(f2);
				f2.connect(g2);
				g2.connect(g);
				sub.connect(sg);
				sg.connect(g);
				n.start();
				n2.start();
				sub.start();
				break;
			}
			case "phaser": {
				const o1 = osc("sine", 1457), o2 = osc("sine", 618);
				const og = ac.createGain();
				og.gain.value = .5;
				const am = ac.createGain();
				am.gain.value = 1;
				lfo(8.3, .5, og.gain);
				lfo(5.6, 60, o1.frequency);
				lfo(4.1, 34, o2.frequency);
				const hf = ac.createBiquadFilter();
				hf.type = "highpass";
				hf.frequency.value = 3e3;
				const hg = ac.createGain();
				hg.gain.value = .07;
				const n = noiseBB();
				n.connect(hf);
				hf.connect(hg);
				hg.connect(g);
				o1.connect(og);
				o2.connect(am);
				og.connect(g);
				am.connect(og);
				o1.start();
				o2.start();
				n.start();
				break;
			}
			case "proton-pack": {
				const n = noiseBB();
				const f = ac.createBiquadFilter();
				f.type = "bandpass";
				f.frequency.value = 640;
				f.Q.value = 2.5;
				const o = osc("square", 104);
				const og = ac.createGain();
				og.gain.value = .16;
				const n2 = noiseBB();
				const hf = ac.createBiquadFilter();
				hf.type = "highpass";
				hf.frequency.value = 4200;
				const hg = ac.createGain();
				hg.gain.value = .1;
				lfo(11, 380, f.frequency);
				lfo(13, .1, og.gain);
				n.connect(f);
				f.connect(g);
				o.connect(og);
				og.connect(g);
				n2.connect(hf);
				hf.connect(hg);
				hg.connect(g);
				n.start();
				n2.start();
				o.start();
				break;
			}
			case "tripod": {
				const n = noiseBB();
				const f = ac.createBiquadFilter();
				f.type = "bandpass";
				f.frequency.value = 3e3;
				f.Q.value = 1.6;
				const ff = ac.createBiquadFilter();
				ff.type = "lowpass";
				ff.frequency.value = 1400;
				const o1 = osc("sawtooth", 38), o2 = osc("sawtooth", 38.7);
				const og = ac.createGain();
				og.gain.value = .5;
				lfo(6.5, 500, f.frequency);
				lfo(.7, .4, og.gain);
				lfo(.31, .4, og.gain);
				n.connect(f);
				f.connect(ff);
				ff.connect(g);
				o1.connect(og);
				o2.connect(og);
				og.connect(g);
				n.start();
				o1.start();
				o2.start();
				const hissG = ac.createGain();
				hissG.gain.value = 0;
				const hn = noiseBB();
				const hf2 = ac.createBiquadFilter();
				hf2.type = "highpass";
				hf2.frequency.value = 5500;
				hn.connect(hf2);
				hf2.connect(hissG);
				hissG.connect(g);
				hn.start();
				extra = (v) => {
					hissG.gain.setTargetAtTime(v > .6 ? .5 : .05, ac.currentTime, .05);
				};
				break;
			}
			case "ironman": {
				const n = noiseBB();
				const f = ac.createBiquadFilter();
				f.type = "bandpass";
				f.frequency.value = 1e3;
				f.Q.value = 4;
				const o1 = osc("square", 220), o2 = osc("square", 331);
				const og = ac.createGain();
				og.gain.value = .14;
				const sub = osc("sine", 82);
				const sg = ac.createGain();
				sg.gain.value = .4;
				lfo(9, 500, f.frequency);
				lfo(6, .08, og.gain);
				n.connect(f);
				f.connect(g);
				o1.connect(og);
				o2.connect(og);
				og.connect(g);
				sub.connect(sg);
				sg.connect(g);
				n.start();
				o1.start();
				o2.start();
				sub.start();
				break;
			}
			default: {
				const n = noiseBB();
				n.connect(g);
				n.start();
			}
		}
		const t = ac.currentTime;
		g.gain.setValueAtTime(1e-4, t);
		return {
			stop: () => {
				try {
					g.gain.setTargetAtTime(1e-4, ac.currentTime, .06);
				} catch {}
				for (const n of nodes) {
					try {
						n.stop?.(ac.currentTime + .25);
					} catch {}
					setTimeout(() => {
						try {
							g.disconnect();
						} catch {}
					}, 400);
				}
			},
			set: (v, dt) => {
				const cur = ac.currentTime;
				g.gain.setTargetAtTime(1e-4 + v * .5, cur, .03);
				for (const n of nodes) if (n.frequency) n.frequency.setTargetAtTime(n.frequency.base64 ?? n.frequency.value, cur, dt);
				extra(v);
			}
		};
	}
	/** continuous driver for channel weapons; spawn/stop loop automatically */
	channel(id, v) {
		if (!this.ac || this.muted || this.ac.state !== "running") {
			this.killLoop(id + "z");
			return;
		}
		const key = "ch:" + id;
		if (v < .04) {
			const l = this.loops.get(key);
			if (l) {
				l.stop();
				this.loops.delete(key);
			}
			return;
		}
		let l = this.loops.get(key);
		if (!l) {
			l = this.startLoop(id);
			this.loops.set(key, l);
		}
		l.set(v, .016);
	}
	killLoop(key) {
		const l = this.loops.get(key);
		if (l) {
			l.stop();
			this.loops.delete(key);
		}
	}
	/** Mega Buster charge whine, driven every frame while holding */
	charge(id, c) {
		if (id !== "mega-buster") return;
		if (!this.ac || this.muted || this.ac.state !== "running") return;
		const key = "charge";
		if (c <= .04) {
			this.killLoop(key);
			return;
		}
		let l = this.loops.get(key);
		if (!l) {
			const ac = this.ac;
			const o = ac.createOscillator();
			o.type = "sawtooth";
			o.frequency.value = 190;
			const o2 = ac.createOscillator();
			o2.type = "sine";
			o2.frequency.value = 380;
			const g = ac.createGain();
			g.gain.value = 1e-4;
			const fl = ac.createBiquadFilter();
			fl.type = "lowpass";
			fl.frequency.value = 900;
			const tr = ac.createGain();
			tr.gain.value = 1;
			const lfo = ac.createOscillator();
			lfo.frequency.value = 30;
			const lg = ac.createGain();
			lg.gain.value = 0;
			lfo.connect(lg);
			lg.connect(tr.gain);
			lfo.start();
			o.connect(fl);
			fl.connect(tr);
			tr.connect(g);
			g.connect(this.fxBus);
			o2.connect(tr);
			o.start();
			o2.start();
			const loop = {
				stop: () => {
					try {
						g.gain.setTargetAtTime(1e-4, ac.currentTime, .05);
					} catch {}
					setTimeout(() => {
						try {
							o.stop();
							o2.stop();
							lfo.stop();
						} catch {}
					}, 200);
				},
				set: (v) => {
					const t = ac.currentTime;
					g.gain.setTargetAtTime(1e-4 + v * .35, t, .03);
					const fq = 190 + v * 620;
					o.frequency.setTargetAtTime(fq, t, .03);
					o2.frequency.setTargetAtTime(fq * 2.02, t, .03);
					fl.frequency.setTargetAtTime(800 + v * 1600, t, .03);
					lg.gain.setTargetAtTime(v > 1.15 ? .55 : 0, t, .05);
				}
			};
			this.loops.set(key, loop);
			l = loop;
		}
		l.set(c, .016);
	}
	startMusic() {
		if (this.mTimer !== void 0 || !this.ac) return;
		this.nextStep = this.ac.currentTime + .1;
		this.step = 0;
		this.mTimer = window.setInterval(() => this.musTick(), 42);
	}
	musTick() {
		if (!this.ac || this.muted || this.ac.state !== "running" || !this.musicOn) return;
		const ac = this.ac;
		const EIGHTH = 60 / 96 / 2;
		while (this.nextStep < ac.currentTime + .24) {
			this.mStep(this.step, this.nextStep);
			this.nextStep += EIGHTH;
			this.step = (this.step + 1) % 64;
		}
	}
	mOsc(type, f, t, dur, vol, pan) {
		if (!this.ac) return;
		const o = this.ac.createOscillator();
		o.type = type;
		o.frequency.value = f;
		const p = this.ac.createStereoPanner();
		p.pan.value = pan;
		const g = this.ac.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.linearRampToValueAtTime(vol, t + .02);
		g.gain.exponentialRampToValueAtTime(2e-4, t + dur);
		o.connect(p);
		p.connect(g);
		g.connect(this.musicBus);
		o.start(t);
		o.stop(t + dur + .05);
		o.onended = () => {
			o.disconnect();
			g.disconnect();
		};
	}
	mNoise(t, dur, vol, hp, pan = 0) {
		if (!this.ac) return;
		const s = this.ac.createBufferSource();
		s.buffer = this.nb;
		s.loop = true;
		const f = this.ac.createBiquadFilter();
		f.type = "highpass";
		f.frequency.value = hp;
		const p = this.ac.createStereoPanner();
		p.pan.value = pan;
		const g = this.ac.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.linearRampToValueAtTime(vol, t + .004);
		g.gain.exponentialRampToValueAtTime(2e-4, t + dur);
		s.connect(f);
		f.connect(p);
		p.connect(g);
		g.connect(this.musicBus);
		s.start(t);
		s.stop(t + dur + .05);
		s.onended = () => {
			s.disconnect();
			g.disconnect();
		};
	}
	mStep(i, t) {
		const bar = Math.floor(i / 16) % 4, p8 = i % 16;
		const R = [
			110,
			87.3,
			130.8,
			98
		][bar];
		if (p8 === 0) {
			const third = bar === 1 || bar === 3 ? R * 2.997 : R * 2.4;
			[
				R,
				R * 1.5,
				third,
				R * 2
			].forEach((f, k) => {
				this.mOsc("sine", f, t, 1.5, .05 - k * .007, (k - 1.5) * .3);
				this.mOsc("triangle", f * 2, t, 1.2, .02, (1.5 - k) * .3);
			});
			this.mOsc("sine", R / 2, t, .4, .16, 0);
		}
		if (p8 % 8 === 1) this.mOsc("sine", R / 2 * 2, t, .22, .13, 0);
		if (p8 % 2 === 1) this.mNoise(t, .05, .02, 7800, (p8 % 4 - 1.5) * .3);
		const arp = [
			1,
			1.5,
			2,
			3,
			4
		][Math.floor(Math.random() * 5)];
		if (p8 % 4 === 2 && Math.random() < .7 || p8 % 8 === 6 && Math.random() < .4) {
			const f = R * 2 * arp * (Math.random() < .3 ? 1.5 : 1);
			this.mOsc("triangle", f, t, .26, .055, Math.sin(t * 1.3) * .6);
		}
		if (p8 === 8 && Math.random() < .5) this.mOsc("sine", R * 3 * (1 + Math.random() * .02), t, .6, .03, -.3);
	}
};