import { Component } from 'react';
import { Icon, Input, Button, Checkbox } from 'antd';
import st from './Login.less';

class Login extends Component {
  login() {
    this.props.history.push('/home');
  }

  componentDidMount() {
    initBackground();
  }

  render() {
    return (
      <div className={st.login}>
        <canvas id="canvas" />
        <div className={st.title}>
          <div />
        </div>
        <div className={st.nh} />
        <div className={st.right}>
          <div className={st.bg} />
          <div className={st.loginpanel}>
            <div className={st.righttitle}>
              <Icon type="desktop" theme="outlined" />&ensp;用户登录
            </div>
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              size="large"
              type="text"
              placeholder="用户名"
            />
            <Input
              prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
              size="large"
              type="password"
              placeholder="密码"
            />
            <div className={st.btns}>
              <Checkbox>记住密码</Checkbox>
              <a href="#">忘记密码？</a>
            </div>
            <Button
              size="large"
              className={st.loginbtn}
              type="primary"
              onClick={this.login.bind(this)}
            >
              登录
            </Button>
          </div>
          <div className={st.rightfooter}>
            <a href="http://jx.zjzwfw.gov.cn/" target="_blank">
              <Icon type="global" theme="outlined" />&ensp;嘉兴市政务服务网
            </a>
            <a href="http://www.jxsmz.gov.cn" target="_blank">
              <Icon type="link" theme="outlined" />&ensp;嘉兴市民政局
            </a>
          </div>
        </div>
        <div className={st.footer}>
          <span>嘉兴市区划地名业务平台</span>
          <span>版权所有：嘉兴市民政局</span>
          <span>技术支持：嘉兴市规划设计研究院有限公司</span>
        </div>
      </div>
    );
  }
}
function initBackground() {
  function Star(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = Math.floor(Math.random() * 2) + 1;
    var alpha = (Math.floor(Math.random() * 10) + 1) / 10 / 2;
    this.color = 'rgba(255,255,255,' + alpha + ')';
  }

  Star.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.r * 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  };

  Star.prototype.move = function() {
    this.y -= 0.15;
    if (this.y <= -10) this.y = HEIGHT + 10;
    this.draw();
  };

  Star.prototype.die = function() {
    stars[this.id] = null;
    delete stars[this.id];
  };

  function Dot(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = Math.floor(Math.random() * 5) + 1;
    this.maxLinks = 2;
    this.speed = 0.5;
    this.a = 0.5;
    this.aReduction = 0.005;
    this.color = 'rgba(255,255,255,' + this.a + ')';
    this.linkColor = 'rgba(255,255,255,' + this.a / 4 + ')';

    this.dir = Math.floor(Math.random() * 140) + 200;
  }

  Dot.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.r * 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  };

  Dot.prototype.link = function() {
    if (this.id == 0) return;
    var previousDot1 = getPreviousDot(this.id, 1);
    var previousDot2 = getPreviousDot(this.id, 2);
    var previousDot3 = getPreviousDot(this.id, 3);
    if (!previousDot1) return;
    ctx.strokeStyle = this.linkColor;
    ctx.moveTo(previousDot1.x, previousDot1.y);
    ctx.beginPath();
    ctx.lineTo(this.x, this.y);
    if (previousDot2 != false) ctx.lineTo(previousDot2.x, previousDot2.y);
    if (previousDot3 != false) ctx.lineTo(previousDot3.x, previousDot3.y);
    ctx.stroke();
    ctx.closePath();
  };

  function getPreviousDot(id, stepback) {
    if (id == 0 || id - stepback < 0) return false;
    if (typeof dots[id - stepback] != 'undefined') return dots[id - stepback];
    else return false; //getPreviousDot(id - stepback);
  }

  Dot.prototype.move = function() {
    this.a -= this.aReduction;
    if (this.a <= 0) {
      this.die();
      return;
    }
    this.color = 'rgba(255,255,255,' + this.a + ')';
    this.linkColor = 'rgba(255,255,255,' + this.a / 4 + ')';
    (this.x = this.x + Math.cos(degToRad(this.dir)) * this.speed),
      (this.y = this.y + Math.sin(degToRad(this.dir)) * this.speed);

    this.draw();
    this.link();
  };

  Dot.prototype.die = function() {
    dots[this.id] = null;
    delete dots[this.id];
  };

  function setCanvasSize() {
    WIDTH = document.documentElement.clientWidth;
    HEIGHT = document.documentElement.clientHeight;

    canvas.setAttribute('width', WIDTH);
    canvas.setAttribute('height', HEIGHT);
  }

  function init() {
    ctx.strokeStyle = 'white';
    ctx.shadowColor = 'white';
    for (var i = 0; i < initStarsPopulation; i++) {
      stars[i] = new Star(i, Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT));
      //stars[i].draw();
    }
    ctx.shadowBlur = 0;
    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (var i in stars) {
      stars[i].move();
    }
    for (var i in dots) {
      dots[i].move();
    }
    drawIfMouseMoving();
    requestAnimationFrame(animate);
  }

  function drawIfMouseMoving() {
    if (!mouseMoving) return;

    if (dots.length == 0) {
      dots[0] = new Dot(0, mouseX, mouseY);
      dots[0].draw();
      return;
    }

    var previousDot = getPreviousDot(dots.length, 1);
    var prevX = previousDot.x;
    var prevY = previousDot.y;

    var diffX = Math.abs(prevX - mouseX);
    var diffY = Math.abs(prevY - mouseY);

    if (diffX < dotsMinDist || diffY < dotsMinDist) return;

    var xVariation = Math.random() > 0.5 ? -1 : 1;
    xVariation = xVariation * Math.floor(Math.random() * maxDistFromCursor) + 1;
    var yVariation = Math.random() > 0.5 ? -1 : 1;
    yVariation = yVariation * Math.floor(Math.random() * maxDistFromCursor) + 1;
    dots[dots.length] = new Dot(dots.length, mouseX + xVariation, mouseY + yVariation);
    dots[dots.length - 1].draw();
    dots[dots.length - 1].link();
  }
  //setInterval(drawIfMouseMoving, 17);

  function degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    WIDTH,
    HEIGHT,
    mouseMoving = false,
    mouseMoveChecker,
    mouseX,
    mouseY,
    stars = [],
    initStarsPopulation = 80,
    dots = [],
    dotsMinDist = 2,
    maxDistFromCursor = 50;

  setCanvasSize();
  init();

  window.onmousemove = function(e) {
    mouseMoving = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    clearInterval(mouseMoveChecker);
    mouseMoveChecker = setTimeout(function() {
      mouseMoving = false;
    }, 100);
  };
}

export default Login;
