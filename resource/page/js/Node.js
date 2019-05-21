var nodelist=new Array();//存放绘制元素的数组
//绘制缓存
var buffer;
var btx;
//结点类
var Node=function(x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null,paste=null){
    this.x=x;
    this.y=y;
    this.theta=0;
    this.color=color;
    this.value=value;
    this.valueShow=valueShow;
    this.font=font;
    this.fontColor=fontColor;
    this.paste=paste;
    this.scaleratio=1;
    this.shadow=true;
    this.id=id;
    this.hide=false;
    this.layer=0;
}
//默认绘制单个结点的函数，可重写
Node.prototype.draw=function(ctx){
    var temp=ctx.fillStyle;
    ctx.fillStyle=this.color;
    ctx.save();
    if(this.shadow){
        ctx.shadowOffsetX = 5; // 阴影Y轴偏移
        ctx.shadowOffsetY = 5; // 阴影X轴偏移
        ctx.shadowBlur = 14; // 模糊尺寸
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 颜色
    }
    ctx.translate(this.x,this.y);
    ctx.scale(this.scaleratio,this.scaleratio);
    ctx.rotate(this.theta*Math.PI/180);
    if(this.paste){
        this.paste(ctx);
        if(this.valueShow){
            var temp2;
            temp2=ctx.fillStyle;
            ctx.fillStyle=this.fontColor;
            ctx.font=this.font;
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.fillText(this.value.toString(),0,0);
            ctx.fillStyle=temp2;
        }
    }
    ctx.restore();
    ctx.fillStyle=temp;
};

//设置结点位置
Node.prototype.setPosition=function(x,y){
    this.x=x;
    this.y=y;
}
//设置x坐标
Node.prototype.setPositionX=function(x){
    this.x=x;
}
//设置y坐标
Node.prototype.setPositionY=function(y){
    this.y=y;
}
//设置颜色
Node.prototype.setColor=function(color){
    this.color=color;
}
//设置阴影开关
Node.prototype.setShadow=function(shadow){
    this.shadow=shadow;
}
//移动结点
Node.prototype.move=function(dx,dy){
    this.x+=dx;
    this.y+=dy;
}
//旋转
Node.prototype.rotate=function(theta){
    this.theta+=theta
}
//绕某一点旋转
Node.prototype.revolve=function(cx,cy,theta){
    var temp;
    temp = (this.x - cx)*Math.cos(theta) - (this.y - cy)*Math.sin(theta) + cx ;
    this.y= (this.x - cx)*Math.sin(theta) + (this.y - cy)*Math.cos(theta) + cy ;
    this.x=temp;
}
//缩放
Node.prototype.scale=function(scaleratio){
    this.scaleratio=scaleratio;
}
//设置value
Node.prototype.setValue=function(value){
    this.value=value;
}
//设置隐藏
Node.prototype.setHide=function(hide){
    this.hide=hide;
}
//设置图层
Node.prototype.setLayer=function(layer){
    this.layer=layer;
}
//调用传入数组中每个元素的draw方法，画出一帧
function DrawFrame(nodelist,ctx){
    if(!buffer){
        buffer=document.createElement("canvas");
        btx=buffer.getContext("2d");
        buffer.width=c.width;
        buffer.height=c.height;
        btx.fillStyle="#d9f0ff";
    }
    btx.fillRect(0,0,buffer.width,buffer.height);
    //找到最底层
    var currentLayer=0;
    for(var i=0;i<nodelist.length;i++)
        if(currentLayer>nodelist[i].layer)
            currentLayer=nodelist[i].layer;
    //从最底层元素开始依次往顶层画
    while(currentLayer<=0){
        for(var i=0;i<nodelist.length;i++){
            if(nodelist[i]&&!nodelist[i].hide&&nodelist[i].layer==currentLayer)
                nodelist[i].draw(btx);
        }
        currentLayer++;
    }
    ctx.drawImage(buffer,0,0,buffer.width,buffer.height,0,0,c.width,c.height);
}

//继承Node的具体图元类
//圆
function NodeCircle(para=20,x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null){
    Node.call(this,x,y,value,color,valueShow,font,fontColor,id);
    this.r=para;
    this.paste=function(ctx){
        ctx.beginPath();
        ctx.arc(0,0,this.r,0,Math.PI*2,true);
        ctx.fill();
    }
}
NodeCircle.prototype=new Node();
NodeCircle.prototype.constructor=NodeCircle;

//矩形
//para：宽，高
//x，y为矩形中心
function NodeRectangle(para=[1,1],x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null){
    Node.call(this,x,y,value,color,valueShow,font,fontColor,id);
    this.width=para[0];
    this.height=para[1];
    this.paste=function(ctx){
        ctx.fillRect(0,0,this.width,this.height);
    }
}
NodeRectangle.prototype=new Node();
NodeRectangle.prototype.constructor=NodeRectangle;

//正方形
function NodeSquare(para=10,x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null){
    Node.call(this,x,y,value,color,valueShow,font,fontColor,id);
    this.width=para;
    this.paste=function(ctx){
        ctx.fillRect(0,0,this.width,this.width);
    }
}
NodeSquare.prototype=new Node();
NodeSquare.prototype.constructor=NodeSquare;

//连接两个结点的线
function NodeLine(para=[0,0,0],x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null){
    Node.call(this,x,y,value,color,valueShow,font,fontColor,id);
    this.startX=x;
    this.startY=y;
    this.endX=para[0];
    this.endY=para[1];
    this.x=(this.startX+this.endX)/2;
    this.y=(this.startY+this.endY)/2;
    this.lineWidth=para[2];
    this.layer=-1;
    this.paste=function(ctx){
        var temp_style=ctx.strokeStyle;
        var temp_width=ctx.lineWidth;
        ctx.strokeStyle=this.color;
        ctx.lineWidth=this.lineWidth;
        ctx.beginPath();
        ctx.moveTo((this.startX-this.endX)/2,(this.startY-this.endY)/2);
        ctx.lineTo((this.endX-this.startX)/2,(this.endY-this.startY)/2);
        ctx.stroke();
        ctx.strokeStyle=temp_style;
        ctx.lineWidth=temp_width;
    }
}
NodeLine.prototype=new Node();
NodeLine.prototype.constructor=NodeLine;

//文字类
function NodeLabel(para="",x=0,y=0,value=0,color="rgb(0,0,0)",valueShow=false,font="20px Arial",fontColor="rgb(255,255,255)",id=null){
    Node.call(this,x,y,value,color,valueShow,font,fontColor,id);
    this.text=para;
    this.value=false;
    this.paste=function(ctx){
        var temp;
        temp=ctx.fillStyle;
        ctx.fillStyle=this.color;
        ctx.font=this.font;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillText(this.text,0,0);
        ctx.fillStyle=temp;
    }
}
NodeLabel.prototype=new Node();
NodeLabel.prototype.constructor=NodeLabel;







