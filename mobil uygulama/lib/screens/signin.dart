import 'package:flutter/material.dart';
import 'package:flutter_application_2/screens/danisan.dart';
import 'package:flutter_application_2/screens/diyetisyen.dart';
import 'package:flutter_application_2/screens/forget_password.dart';
import 'package:flutter_application_2/screens/signup.dart';
import 'package:flutter_application_2/services/auth_service.dart';
import 'package:flutter_application_2/theme/theme.dart';
import 'package:flutter_application_2/widgets/custom_scaffold.dart';
import 'package:icons_plus/icons_plus.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({super.key});

  @override
  State<SignInPage> createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  final _formKey = GlobalKey<FormState>();
  bool rememberPassword = true;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  final AuthService _authService = AuthService();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
     super.dispose();
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            child: const Text('OK'),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      child: Column(
        children: <Widget>[
          const Expanded(
            flex: 1,
            child: SizedBox(height: 10),
          ),
          Expanded(
            flex: 7,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(40.0),
                  topRight: Radius.circular(40.0),
                ),
              ),
              child: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text(
                        'Welcome back!',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: const Color.fromARGB(255, 0, 0, 0),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // E-mail input
                      TextFormField(
                        controller: _emailController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your email';
                          }
                          return null;
                        },
                        decoration: InputDecoration(
                          labelText: 'Email',
                          hintText: 'Enter your email',
                          hintStyle: const TextStyle(color: Colors.grey),
                          border: OutlineInputBorder(
                            borderSide:
                                const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide:
                                const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Password input
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        obscuringCharacter: '*',
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your password';
                          }
                          return null;
                        },
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Enter your password',
                          hintStyle: const TextStyle(color: Colors.grey),
                          border: OutlineInputBorder(
                            borderSide:
                                const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide:
                                const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Remember me + Forgot password
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Checkbox(
                                value: rememberPassword,
                                onChanged: (bool? value) {
                                  setState(() {
                                    rememberPassword = value!;
                                  });
                                },
                                activeColor:
                                    const Color.fromARGB(255, 6, 58, 28),
                              ),
                              const Text(
                                'Remember me',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const ForgetPasswordPage(),
                                ),
                              );
                              // Navigate to forget password page
                            },
                            child: const Text(
                              'Forget Password?',
                              style: TextStyle(
                                color: Color.fromARGB(255, 6, 58, 28),
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20.0),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : () async { // 'async' eklendi
      
                              if (_formKey.currentState!.validate()) {
                                // Form geçerliyse
                                
                                setState(() {
                                  _isLoading = true; // Yükleniyor...
                                });

                                // --- API'Yİ ÇAĞIR ---
                                final result = await _authService.login(
                                  _emailController.text,
                                  _passwordController.text,
                                );
                               
                                if (!mounted) return;

                                setState(() {
                                  _isLoading = false; // Yüklenme bitti
                                });


                                // API'den gelen cevabı kontrol et
                                if (result['success'] == true) {
                                  // Giriş başarılı!
                                  
                                  // .NET'ten gelen "role" bilgisine bak
                                  String role = result['data']['role']; 
                                  
                                  
                                  if (role == "Danisan") {
                                    // Danışan ise danisan.dart'a git
                                    int userID = result['data']['userId'];
                                    Navigator.pushReplacement(
                                      context,
                                      MaterialPageRoute(builder: (context) => ClientHomePage(userId: userID)),
                                    );
                                  } else if (role == "Diyetisyen") {
                                    
                                    int userID = result['data']['userId'];
                                    Navigator.pushReplacement(
                                      context,
                                      MaterialPageRoute(builder: (context) => DietitianHomePage(userId: userID)),
                                    );
                                  } else {
                                    // Rol bilinmiyorsa (olmaması lazım) hata göster
                                    _showErrorDialog("Geçersiz kullanıcı rolü.");
                                  }

                                } else {
                                  // Giriş başarısız! .NET'ten gelen hatayı göster
                                  _showErrorDialog(result['message']);
                                }
                              }
                            },
                            // --- BİTİŞ: "onPressed" DEĞİŞİKLİĞİ ---

                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                 const Color.fromARGB(255, 125, 153, 92),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20.0),
                              ),
                            ),
                            
                            // --- BAŞLANGIÇ: Buton "child" değişikliği ---
                            child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.white) // Yükleniyorsa
                              : const Text(
                                  'Sign In',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18.0,
                                  ),
                                ),
                          
                        ),
                      ),
                      const SizedBox(height: 20.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Divider(
                              color: Colors.grey.withOpacity(0.5),
                              thickness: 0.7,
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 10.0,
                              vertical: 0.0,
                            ),
                            child: Text(
                              'Sign up with',
                              style: TextStyle(
                                color: Colors.grey,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Divider(
                              color: Colors.grey,
                              thickness: 1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Logo(Logos.google),
                          Logo(Logos.apple),
                          Logo(Logos.microsoft),
                        ],
                      ),
                      const SizedBox(height: 10.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            "Don't have an account? ",
                            style: TextStyle(color: Colors.grey),
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => SignUpPage(),
                                ),
                              );
                            },
                            child: const Text(
                              'Sign up',
                              style: TextStyle(
                                color: const Color.fromARGB(255, 125, 153, 92),
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ],
                      ),
                        const SizedBox(height: 15.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }
  }



