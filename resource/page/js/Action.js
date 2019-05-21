var AClist=new Array();//存放绘制动作的数组
var currentAC=0;//动作数组指针
var framenum=50;//帧数
//动作类
//i：索引要执行动作的第一个结点
//j：索引要执行动作的第二个结点
//若要索引更多结点，放在para中
//nodelist：存放图元的数组，用于所有用到矩阵或列表的算法
//nextAC：下一个动作
//para：1.传递动画执行需要的参数
//      2.初始化动画执行中恒定不变的参数，主要为delta
//count：帧数，也是倒计时
var AC = function (i, j, nodelist, nextAC = null, para = null, count = 0, init=null,newFrame = null, update=null) {
    this.originalCount = count;//记录最初的帧数
    this.count = count;
    this.i = i;
    this.j = j;
    this.nodelist = nodelist;
    this.next = nextAC;
    this.para = para;
    this.initialed=false;
    //动画设置函数
    this.init=init;//设置用于更新的动画参数
    this.newFrame = newFrame;//计算新帧，生成动画的规则
    this.update = update;//更新元组数据
}
AC.prototype.setNext = function (ac) {
    this.next = ac;
}
AC.prototype.setCount = function (count) {
    this.count = count;
}
//播放动作，类方法
AC.Play = function (ac,ctx) {
    //流程控制
    if (ac.count == 0) {
        currentAC++;
        if (ac.next && AC.running) {
            requestAnimationFrame(function () {
                AC.Play(ac.next,ctx);
            });
        }
        return;
    }
    //特定的帧函数
    if(ac.init)
        ac.init();
    function actFrame() {
        //更新并绘制新页面
        if (ac.newFrame)
            ac.newFrame();
        DrawFrame(ac.nodelist, ctx);
        //流程控制
        ac.count--;
        if (ac.count > 0) {
            if (AC.running)
                requestAnimationFrame(actFrame);
        } else {
            //增、删、交换nodelist中的元素
            if (ac.update)
                ac.update();
            //流程控制
            if (ac.next && AC.running) {
                if (!AC.stepping) {
                    currentAC++;
                    requestAnimationFrame(function () {
                        AC.Play(ac.next,ctx);
                    });
                } else {
                    AC.Pause();
                }
            }else if(AC.running){//!ac.next
                AC.End();
            }
        }
    }
    actFrame();
}
AC.pausing=false;
AC.running=false;
AC.steping=false;
AC.ending=false;
AC.Start=function(ctx) {
    if(!AC.ending){
        AC.running = 1;
        AC.stepping=false;
        AC.Play(AClist[currentAC],ctx);
    }
}
AC.Pause=function(){
    AC.pausing=true;
    AC.running=false;
    AC.stepping=false;
}
AC.Clear=function(){
    ctx.clearRect(0,0,c.width,c.height);
    nodelist.splice(0);
    currentAC=0;
    AC.ending=false;
    AClist.splice(0);

}
AC.Step=function(){
    if(!AC.stepping&&!AC.ending){
        AC.running=true;
        AC.stepping=true;
        AC.Play(AClist[currentAC],ctx);
    }
}
AC.End=function(){
    AC.running=false;
    AC.steping=false;
    AC.ending=true;
}
/*具体的动作类
实现了一些基础的动作，具体的算法步骤则
通过修改update函数，来保证算法执行过程中
绘制元素与算法的元素吻合
*/

//移动单个结点
//para：[位移量x，位移量y]
function ACmove(i=-1, j=-1, nodelist, nextAC = null, para = null, count = 0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.newFrame=function(){
        this.nodelist[this.i].move(this.para[0]/this.originalCount,this.para[1]/this.originalCount);
    }
    this.update=update;
}
ACmove.prototype =new AC();
ACmove.prototype.constructor=ACmove;

//交换两个结点
//para:null
function ACswap(i=-1, j=-1, nodelist, nextAC = null, para = null, count = 0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.init=function(){
        if(!this.initialed){
            this.para=[];
            this.para[0]=(this.nodelist[this.j].x-this.nodelist[this.i].x)/this.count;
            this.para[1]=(this.nodelist[this.j].y-this.nodelist[this.i].y)/this.count;
            this.initialed=true;
        }
    }
    this.newFrame=function(){
        this.nodelist[this.i].move(this.para[0],this.para[1]);
        this.nodelist[this.j].move(-this.para[0],-this.para[1]);
    }
    this.update=update;
}
ACswap.prototype =new AC();
ACswap.prototype.constructor=ACswap;

//改变1或2个结点大小
//para:缩放大小
function ACscale(i=-1, j=-1, nodelist, nextAC = null, para = 1, count = 0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.init=function(){
        if(!this.initialed){
            this.para=(this.para-this.nodelist[this.i].scaleratio)/this.count;
            this.initialed=true;
        }
    }
    this.newFrame=function(){
        this.nodelist[this.i].scale(this.nodelist[this.i].scaleratio+this.para);
        if(this.j!=-1)this.nodelist[this.j].scale(this.nodelist[this.j].scaleratio+this.para);
    }
    this.update=update;
}
ACscale.prototype =new AC();
ACscale.prototype.constructor=ACscale;

//1或2个结点颜色突变动画
function ACcolor(i=0,j=0,nodelist,nextAC=null,para=targetColor,count=0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.init=function(){
        this.count=1;
        this.nodelist[this.i].color=this.para;
    }
    this.update=update;
}
ACcolor.prototype =new AC();
ACcolor.prototype.constructor=ACcolor;

//闪烁变色
function ACflash(i=0,j=0,nodelist,nextAC=null,para=targetColor,count=0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.init=function(){
        if(!this.initialed){
            while(this.count%5!=0)this.count+=1;
            if((this.count/5)%2!=0)this.count+=5;
            this.initialed=true;
        }
    }
    this.newFrame=function(){
        //交换原有颜色和目标颜色
        if(this.count%5==0){
            var temp=this.nodelist[this.i].color;
            this.nodelist[this.i].color=this.para;
            this.para=temp;
        }
    }
    this.update=update;
}
ACflash.prototype =new AC();
ACflash.prototype.constructor=ACflash;

//两个结点间延伸线动画
function ACaddLine(i=0,j=0,nodelist,nextAC=null,para=20,count=0,update=null){
    AC.call(this,i, j, nodelist, nextAC, para, count);
    this.lineWidth=para;
    this.init=function(){
        if(!this.initialed){
            this.para=[];
            this.para[0]=this.nodelist[this.j].x-this.nodelist[this.i].x;
            this.para[1]=this.nodelist[this.j].y-this.nodelist[this.i].y;
            this.para[0]=this.para[0]/count;
            this.para[1]=this.para[1]/count;
            var l=new NodeLine([this.nodelist[this.i].x,this.nodelist[this.i].y,this.lineWidth],this.nodelist[this.i].x,this.nodelist[this.i].y,0,"rgba(255,0,0,0.5)")
            this.nodelist.push(l);
            this.initialed=true;
        }
    }    
    this.newFrame=function(){
        this.nodelist[this.nodelist.length-1].endX+=this.para[0];
        this.nodelist[this.nodelist.length-1].endY+=this.para[1];
        this.nodelist[this.nodelist.length-1].x=(this.nodelist[this.nodelist.length-1].startX+this.nodelist[this.nodelist.length-1].endX)/2;
        this.nodelist[this.nodelist.length-1].y=(this.nodelist[this.nodelist.length-1].startY+this.nodelist[this.nodelist.length-1].endY)/2;
    }
    this.update=update;
}
ACaddLine.prototype =new AC();
ACaddLine.prototype.constructor=ACaddLine;




