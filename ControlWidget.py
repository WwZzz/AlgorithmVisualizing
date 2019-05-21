#!/usr/bin/env python
# -*- coding:utf-8 -*-
# Author: jyroy
import sys,os,shutil
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtWidgets import QApplication, QVBoxLayout
from PyQt5.QtWidgets import QListWidget, QStackedWidget
from PyQt5.QtWidgets import QListWidgetItem
from PyQt5.QtWidgets import QWidget,QSplitter
from PyQt5.QtWidgets import QHBoxLayout
from PyQt5.QtCore import QSize, Qt
from bs4 import BeautifulSoup as bs

class ControlWidget(QWidget):
    #包含左边的导航和右边的显示窗口两部分
    def __init__(self):
        super(ControlWidget, self).__init__()
        self.setObjectName('ControlWidget')
        with open('./QSS/QListWidgetQSS.qss', 'r') as f:  # 导入QListWidget的qss样式
            self.list_style = f.read()

        self.mainLayout = QHBoxLayout(self)  # 窗口的整体布局
        self.mainLayout.setSpacing(0)
        self.mainLayout.setContentsMargins(0, 0, 0, 0)
        #分割器使得两个窗口可以自由滑动
        self.splitter=QSplitter(self)
        self.splitter.setOrientation(Qt.Horizontal)
        self.splitter.setHandleWidth(1)
        self.splitter.setStretchFactor(0,1)
        self.splitter.setStretchFactor(1,6)
        self.splitter.setObjectName("splitter")
        # 分割器中采用垂直布局
        self.verticalLayoutWidget = QWidget(self.splitter)
        self.verticalLayoutWidget.setObjectName("verticalLayoutWidget")
        self.verticalLayout = QVBoxLayout(self.verticalLayoutWidget)
        self.verticalLayout.setContentsMargins(0, 0, 0, 0)
        self.verticalLayout.setObjectName("verticalLayout")
        # 将分割器添加进整体布局中
        self.mainLayout.addWidget(self.splitter)

        self.left_widget = QListWidget()  # 左侧选项列表
        self.left_widget.setStyleSheet(self.list_style)
        self.verticalLayout.addWidget(self.left_widget)
        self.left_widget.resize(QSize(120,780))
        self._setup_ui()

    def _setup_ui(self):
        '''加载界面ui'''
        self.left_widget.itemPressed.connect(self.reshow)  # list和右侧窗口的index对应绑定
        self.left_widget.setFrameShape(QListWidget.NoFrame)  # 去掉边框
        self.left_widget.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.indexList=[]
        file=open("resource/configuration.txt")
        self.data=[]
        for line in file:
            line=line.strip('\n')
            s=line.split()
            self.data.append(s)
        file.close()
        for indexMSG in self.data:
            self.item = IndexItem(name=indexMSG[0],algorithmList=indexMSG[1:])
            self.item.setSizeHint(QSize(50, 40))
            self.item.setTextAlignment(Qt.AlignCenter)
            self.indexList.append(self.item)
            self.left_widget.addItem(self.item)
            """
            path=os.getcwd()+'/resource/'+indexMSG[0]
            if (not os.path.exists(path)):
                os.makedirs(path)
            if(os.path.exists(path+'/index.html')):
                os.remove(path+'/index.html')
            shutil.copy(os.getcwd()+'/resource/'+'page/index.html',path);
            for x in range(1,len(indexMSG)):
                path=os.getcwd()+'/resource/'+indexMSG[0]+'/'+indexMSG[x]
                if(not os.path.exists(path)):
                    os.makedirs(path)
        """
        self.homeUrl="/resource/page/home.html"
        self.right_widget = QWebEngineView()  # 右侧用QWebView来显示html网页
        self.right_widget.setContextMenuPolicy(Qt.NoContextMenu)
        self.right_widget.load(QUrl.fromLocalFile(self.homeUrl))
        self.currentPage=self.homeUrl
        self.splitter.addWidget(self.right_widget)
        self.right_widget.urlChanged.connect(self.ItemChoose)
    def ItemChoose(self):
        self.currentPage=self.right_widget.url()
    def reshow(self):
        if(self.currentPage!=self.left_widget.currentItem().getUrl()):
            self.currentPage = self.left_widget.currentItem().getUrl()
            self.right_widget.load(QUrl.fromLocalFile(self.left_widget.currentItem().getUrl()))
    def goHome(self):
        if self.currentPage!=self.homeUrl:
            self.right_widget.load(QUrl.fromLocalFile(self.homeUrl))
            self.currentPage = self.homeUrl
            self.left_widget.currentItem().setSelected(False)
class IndexItem(QListWidgetItem):
    def __init__(self,parent=None,name='',algorithmList=[]):
        super(IndexItem,self).__init__(parent)
        self.setText(name)
        self.setTextAlignment( Qt.AlignCenter)
        self.algorithmList=algorithmList
        self.urlList=[]
        self.url='/resource/'+name+'/index.html'
        for algorithmName in algorithmList:
            self.urlList.append('/resource/'+name+'/'+algorithmName+'/'+'item.html')
    def getUrl(self):
        return self.url






