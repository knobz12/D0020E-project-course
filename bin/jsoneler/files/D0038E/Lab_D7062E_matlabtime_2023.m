%% Matlab code D7062E

I=imread('cameraman.tif');
%%
figure,imshow(I)
%%
I_d=im2double(I);
%%
max(I(:))
%%
max(I_d(:))
%%
size(I)
%%
C=imread('autumn.tif'); %24-bit
%%
figure,imshow(C)
%%
size(C)
%%
C(100,200,2)
%%
C(100,200,:)
%%
impixel(C,200,100)
%%
imfinfo('cameraman.tif')
%% Data conversion
A =[-8.0000 4.0000 0 0.5000]
B = uint8(A)
%%
Cgr=rgb2gray(C);
%%
figure,imshow(Cgr)
%%
Cdouble=double(Cgr);
%%
figure,imshow(Cdouble)
%%
Cdouble=im2double(Cgr); %% or Cgr/255
%%
figure,imshow(Cdouble)
%%
Cgr1_2=imresize(Cgr,1/2);
%%
figure,imshow(Cgr1_2)
%%
Cgr_2=imresize(Cgr,2);
%%
figure,imshow(Cgr_2)

%% Point  Operations
C1=imadd(C,128);
%%
C2=imsubtract(C,128);
%%
imshow(C1),figure,imshow(C2)
%%
C3=immultiply(C,0.5); 
C4=imdivide(C,0.5);
imshow(C3),figure,imshow(C4)
% % % %%
% % % C5=imadd(immultiply(C,0.5),128);
% % % imshow(C5)
%%
C_c=imcomplement(C);
imshow(C_c)
%%
imhist(I);
%%
Ia=histeq(I);
figure, imshow(Ia)
%%
imhist(Ia);
%% segmentation
r=imread('hand.png');
imshow(r),figure
r=rgb2gray(r);
imshow(r),figure
imhist(r);
%%
% r=rgb2gray(r);
rth=r>70;
imshow(rth)
%%
% level = graythresh(I)
BW = imbinarize(r,0.5);
figure
imshowpair(r,BW,'montage')
%%
r_c=imcomplement(rth);
figure,imshow(r_c)
%%  edges
edge_s=edge(r,'sobel');
figure,imshow(edge_s)