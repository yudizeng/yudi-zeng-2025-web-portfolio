(() => {
  const opening = document.querySelector('.opening');
  const cover = document.querySelector('.hero');
  const replay = document.querySelector('.intro-replay');
  if (!opening || !cover) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const content = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')];
  const note = document.querySelector('.hero-note p');
  const printReplay = document.querySelector('.print-replay');
  const text = note.textContent;
  let timers = [], frame = 0, printFrame = 0, running = false, arrivalTimer;
  const canvas = opening.querySelector('canvas');
  // A continuous noise field erodes the cover from its centre, with a soft organic edge.
  let gl, program;
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (gl) {
      const shader = (type, source) => {
        const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error('Shader unavailable');
        return s;
      };
      program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0.,1.);}'));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `precision highp float;
        uniform vec2 resolution; uniform float progress;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
        float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=p*2.03+vec2(3.1,7.2);a*=.5;}return n;}
        void main(){vec2 uv=gl_FragCoord.xy/resolution;float aspect=resolution.x/resolution.y;
          vec2 p=(uv-.5)*vec2(aspect,1.);float d=length(p)/length(vec2(aspect,1.));
          float field=d+fbm(p*5.7)*.24+noise(p*160.)*.018;
          float edge=progress*.97-.18;float alpha=smoothstep(edge-.018,edge+.018,field);
          gl_FragColor=vec4(vec3(.082),alpha);}`));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Program unavailable');
      gl.useProgram(program);
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const pos = gl.getAttribLocation(program, 'pos'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    }
  } catch { gl = null; }
  const paint = progress => {
    if (!gl) {
      canvas.style.background = '#151515';
      canvas.style.maskImage = progress === 0 ? 'none' : `radial-gradient(ellipse at center, transparent ${progress*155}%, #000 ${progress*155+12}%)`;
      return;
    }
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.round(innerWidth*ratio), height = Math.round(innerHeight*ratio);
    if (canvas.width !== width || canvas.height !== height) {canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    canvas.style.background = 'transparent';
    gl.uniform2f(gl.getUniformLocation(program,'resolution'), width,height);
    gl.uniform1f(gl.getUniformLocation(program,'progress'), progress);
    gl.drawArrays(gl.TRIANGLES,0,6);
  };
  const print = () => {
    cancelAnimationFrame(printFrame);
    note.classList.remove('print-complete');
    note.replaceChildren();
    const source = document.createElement('span'); source.className='print-source'; source.textContent=text;
    const ghost = document.createElement('span'); ghost.className='print-ghost'; ghost.textContent=text; ghost.setAttribute('aria-hidden','true');
    const output = document.createElement('span'); output.className='print-output'; output.setAttribute('aria-hidden','true');
    note.append(source, ghost, output);
    const start=performance.now();
    const tick = now => {
      const count=Math.min(text.length,Math.floor((now-start)/19));
      output.textContent=text.slice(0,count);
      if(count<text.length) printFrame=requestAnimationFrame(tick);
      else note.classList.add('print-complete');
    };
    printFrame=requestAnimationFrame(tick);
  };
  const enter = () => {
    clearTimeout(arrivalTimer);
    cover.classList.remove('is-arriving'); void cover.offsetWidth; cover.classList.add('is-arriving');
    arrivalTimer=setTimeout(()=>cover.classList.remove('is-arriving'),1500);
  };
  const finish = () => {
    timers.forEach(clearTimeout); timers=[]; cancelAnimationFrame(frame);
    opening.hidden=true; content.forEach(node=>{node.inert=false;});
    document.documentElement.style.overflow='';
    if(opening.contains(document.activeElement)) replay.focus({preventScroll:true});
    running=false;
  };
  const play = () => {
    if(running || reduced.matches) return;
    running=true; opening.classList.remove('is-dissolving'); opening.hidden=false;
    paint(0); cover.classList.remove('is-arriving');
    const word=opening.querySelector('.opening-word span');word.textContent='';
    [...'Hello.'].forEach((letter,index)=>timers.push(setTimeout(()=>{word.textContent+=letter;},120+index*105)));
    content.forEach(node=>{node.inert=true;});document.documentElement.style.overflow='hidden';
    timers.push(setTimeout(()=>{
      opening.classList.add('is-dissolving'); enter();
      const start=performance.now();
      const dissolve=now=>{const p=Math.min(1,(now-start)/1500);paint(p);if(p<1)frame=requestAnimationFrame(dissolve);};
      frame=requestAnimationFrame(dissolve);
    },1100));
    timers.push(setTimeout(print,2050));
    timers.push(setTimeout(finish,2650));
  };
  const skip = () => {finish();enter();if(!reduced.matches)print();};
  opening.querySelector('button').addEventListener('click',skip);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&running)skip();});
  replay.hidden=reduced.matches;printReplay.hidden=reduced.matches;
  replay.addEventListener('click',play);printReplay.addEventListener('click',print);
  reduced.addEventListener('change',()=>{finish();cancelAnimationFrame(printFrame);note.textContent=text;replay.hidden=reduced.matches;printReplay.hidden=reduced.matches;});
  window.addEventListener('pagehide',finish);
  if(!location.hash || location.hash==='#top')play();
})();
