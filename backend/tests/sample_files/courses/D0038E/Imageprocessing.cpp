// LPR.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include "core/core.hpp"
#include "highgui/highgui.hpp"
#include "opencv2/opencv.hpp"

using namespace cv;
using namespace std;


Mat convertgrey(Mat RGB)
{
	Mat grey = Mat::zeros(RGB.size(), CV_8UC1);

	for (int i = 0; i < RGB.rows; i++)
	{
		for (int j = 0; j < RGB.cols * 3; j += 3)
		{
			grey.at<uchar>(i, j / 3) = (RGB.at<uchar>(i, j) + RGB.at<uchar>(i, j + 1) + RGB.at<uchar>(i, j + 2)) / 3;
		}
	}

	return grey;
}

Mat convertbinary(Mat grey , int th)
{
	Mat binary = Mat::zeros(grey.size(), CV_8UC1);

	for (int i = 0; i < grey.rows; i++)
	{
		for (int j = 0; j < grey.cols; j++)
		{
			if (grey.at<uchar>(i, j) >= th)
			{
				binary.at<uchar>(i, j) = 255;
			}
		}
	}

	return binary;
}

Mat invertgrey(Mat grey)
{
	Mat invert = Mat::zeros(grey.size(), CV_8UC1);

	for (int i = 0; i < grey.rows; i++)
	{
		for (int j = 0; j < grey.cols; j++)
		{
			invert.at<uchar>(i, j) = 255 - grey.at<uchar>(i, j);
		}
	}

	return invert;
}

Mat blurify(Mat grey)
{
	Mat blur = grey;
	int x = 1; // x = radius
	int y = 2 * x + 1; // y = width

	for (int i = x; i < grey.rows - x; i++)
	{
		for (int j = x; j < grey.cols - x; j++)
		{
			int total = 0;
			int avg = 0;
			for (int ii = i - x; ii < i + x + 1; ii++)
			{
				for (int jj = j - x; jj < j + x + 1; jj++)
				{
					total += grey.at<uchar>(ii, jj);
				}
			}
			avg = total / (y * y);
			blur.at<uchar>(i, j) = avg;
		}
	}

	return blur;
}

Mat equalize(Mat grey)
{
	Mat equal = Mat::zeros(grey.size(), CV_8UC1);
	int count[256] = { 0 };
	int newvalue[256] = { 0 };

	for (int i = 0; i < grey.rows; i++)
	{
		for (int j = 0; j < grey.cols; j++)
		{
			count[grey.at<uchar>(i, j)]++;
		}
	}

	int accu = 0;
	int area = grey.cols * grey.rows;

	for (int k = 0; k < 256; k++)
	{
		accu += count[k];
		float prob = (float)((float)accu / (float)area);
		newvalue[k] = prob * 255;
	}

	for (int i = 0; i < grey.rows; i++)
	{
		for (int j = 0; j < grey.cols; j++)
		{
			equal.at<uchar>(i, j) = newvalue[grey.at<uchar>(i, j)];
		}
	}

	return equal;
}

Mat FindEdge(Mat grey)
{
	Mat newmat = Mat::zeros(grey.size(), CV_8UC1);

	for (int i = 1; i < grey.rows - 1; i++)
	{
		for (int j = 1; j < grey.cols - 1; j++)
		{
			int left = (grey.at<uchar>(i - 1, j - 1) + grey.at<uchar>(i, j - 1) + grey.at<uchar>(i + 1, j - 1)) / 3;
			int right = (grey.at<uchar>(i - 1, j + 1) + grey.at<uchar>(i, j + 1) + grey.at<uchar>(i + 1, j + 1)) / 3;

			if (abs(left - right) > 50)
			{
				newmat.at<uchar>(i, j) = 255;
			}
		}
	}

	return newmat;
}

Mat Dilute(Mat edge, int rad) //turns pixels white if any pixel within rad range is white
{
	Mat dil = Mat::zeros(edge.size(), CV_8UC1);

	for (int i = rad; i < edge.rows - rad; i++)
	{
		for (int j = rad; j < edge.cols - rad; j++)
		{
			int flag = 0; //1 if any pixel within range is white

			for (int ii = i - rad; ii < i + rad + 1; ii++)
			{
				for (int jj = j - rad; jj < j + rad + 1; jj++)
				{
					if (edge.at<uchar>(ii, jj) == 255)
					{
						flag = 1;
						break;
					}
				}

				if (flag == 1)
				{
					break;
				}
			}

			if (flag == 1)
			{
				dil.at<uchar>(i, j) = 255;
			}
		}
	}

	return dil;
}

int main()
{
	Mat image = imread("C:\\Users\\mokham\\Documents\\4.jpg");
	Mat GreyImg = convertgrey(image);
	imshow("test", image);
	imshow("Grey test", GreyImg);

	Mat equal = equalize(GreyImg);
	imshow("Test2", equal);

	Mat blur = blurify(equal);
	imshow("Test3", blur);

	Mat edgy = FindEdge(blur);
	imshow("Test4", edgy);

	Mat dil = Dilute(edgy, 3);
	imshow("Test5", dil);

	Mat ditto;
	ditto = dil.clone();
	vector<vector<Point>> contours1;
	vector<Vec4i> hierachy1;
	findContours(dil, contours1, hierachy1, RETR_EXTERNAL, CHAIN_APPROX_NONE, Point(0, 0));
	Mat dst = Mat::zeros(GreyImg.size(), CV_8UC3);

	if (!contours1.empty())
	{
		for (int i = 0; i < contours1.size(); i++)
		{
			Scalar colour((rand() & 255), (rand() & 255), (rand() & 255));
			drawContours(dst, contours1, i, colour, -1, 8, hierachy1);
		}
	}

	imshow("Test6", dst);
	Mat plate;
	Rect rect;
	Scalar black = CV_RGB(0, 0, 0);
	for (int i = 0; i < contours1.size(); i++)
	{
		rect = boundingRect(contours1[i]);

		if (rect.width < 70 || rect.width > 100 || rect.height > 45 || rect.height < 30)
		{
			drawContours(ditto, contours1, i, black, -1, 8, hierachy1);
		}
		else
		{
			plate = GreyImg(rect);
		}
	}

	imshow("Test7", ditto);
	imshow("Test8", plate);

	/*Mat Greyplate = convertbinary(plate , 130);
	imshow("Test8", Greyplate);*/


	waitKey();

	/*
		// Declare the output variables
		Mat  cdst, cdstP;
		// Loads an image
		Mat src = imread("C:\\Users\\mokham\\Documents\\1.jpg", IMREAD_GRAYSCALE);
		// Check if image is loaded fine
		
		// Edge detection
		Canny(src, dst, 50, 200, 3);
		// Copy edges to the images that will display the results in BGR
		cvtColor(dst, cdst, COLOR_GRAY2BGR);
		cdstP = cdst.clone();
		// Standard Hough Line Transform
		vector<Vec2f> lines; // will hold the results of the detection
		HoughLines(dst, lines, 1, CV_PI / 180, 150, 0, 0); // runs the actual detection
		// Draw the lines
		for (size_t i = 0; i < lines.size(); i++)
		{
			float rho = lines[i][0], theta = lines[i][1];
			Point pt1, pt2;
			double a = cos(theta), b = sin(theta);
			double x0 = a * rho, y0 = b * rho;
			pt1.x = cvRound(x0 + 1000 * (-b));
			pt1.y = cvRound(y0 + 1000 * (a));
			pt2.x = cvRound(x0 - 1000 * (-b));
			pt2.y = cvRound(y0 - 1000 * (a));
			line(cdst, pt1, pt2, Scalar(0, 0, 255), 3, LINE_AA);
		}
		// Probabilistic Line Transform
		vector<Vec4i> linesP; // will hold the results of the detection
		HoughLinesP(dst, linesP, 1, CV_PI / 180, 50, 50, 10); // runs the actual detection
		// Draw the lines
		for (size_t i = 0; i < linesP.size(); i++)
		{
			Vec4i l = linesP[i];
			line(cdstP, Point(l[0], l[1]), Point(l[2], l[3]), Scalar(0, 0, 255), 3, LINE_AA);
		}
		// Show results
		imshow("Source", src);
		imshow("Detected Lines (in red) - Standard Hough Line Transform", cdst);
		imshow("Detected Lines (in red) - Probabilistic Line Transform", cdstP);
		// Wait and Exit
		waitKey();
		*/
	
	std::cout << "Hello World!\n";
}

// Run program: Ctrl + F5 or Debug > Start Without Debugging menu
// Debug program: F5 or Debug > Start Debugging menu

// Tips for Getting Started: 
//   1. Use the Solution Explorer window to add/manage files
//   2. Use the Team Explorer window to connect to source control
//   3. Use the Output window to see build output and other messages
//   4. Use the Error List window to view errors
//   5. Go to Project > Add New Item to create new code files, or Project > Add Existing Item to add existing code files to the project
//   6. In the future, to open this project again, go to File > Open > Project and select the .sln file
