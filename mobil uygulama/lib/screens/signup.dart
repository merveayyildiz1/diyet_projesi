import 'package:flutter/material.dart';
import 'package:flutter_application_2/screens/danisan.dart';
import 'package:flutter_application_2/screens/diyetisyen.dart';
import 'package:flutter_application_2/widgets/custom_scaffold.dart';
import 'package:flutter_application_2/services/auth_service.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _formSignUpKey = GlobalKey<FormState>();
  bool agreePersonalData = true;

  // Kullanıcı tipi: true = Danışan, false = Diyetisyen
  bool isConsultant = true;

  // 1. Controller'ları ekleyin
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _clinicController = TextEditingController(); // Diyetisyen için
  final _invitationCodeController = TextEditingController(); // Danışan için

  // 2. API Servisini ve yüklenme durumunu ekleyin
  final AuthService _authService = AuthService();
  bool _isLoading = false; 

  @override
  void dispose() {
    // 3. Controller'ları temizleyin
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _clinicController.dispose();
    _invitationCodeController.dispose();
    super.dispose();
  }
  
  // 4. Hata gösterme metodu ekleyin
  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Kayıt Hatası'),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            child: Text('Tamam'),
            onPressed: () {
              Navigator.of(ctx).pop();
            },
          )
        ],
      ),
    );
  }
  // --- YENİ EKLENENLER BİTİŞ ---

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      child: Column(
        children: [
          const Expanded(child: SizedBox(height: 10)),

          // Kullanıcı tipi seçimi
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        isConsultant = true; // Danışan seçili
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      decoration: BoxDecoration(
                        color: isConsultant ? const Color.fromARGB(255, 125, 153, 92) : const Color.fromARGB(255, 255, 252, 252),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Danışan',
                        style: TextStyle(
                          color: isConsultant ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        isConsultant = false; // Diyetisyen seçili
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      decoration: BoxDecoration(
                        color: !isConsultant ? const Color.fromARGB(255, 125, 153, 92) : const Color.fromARGB(255, 255, 252, 252),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Diyetisyen',
                        style: TextStyle(
                          color: !isConsultant ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Form alanı
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
                key: _formSignUpKey,
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(height: 20.0),

                      // Name
                      TextFormField(
                        controller: _firstNameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your name';
                          }
                          return null;
                        },
                        decoration: InputDecoration(
                          labelText: 'Name',
                          hintText: 'Enter your name',
                          hintStyle: const TextStyle(color: Colors.grey),
                          border: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Surname
                      TextFormField(
                        controller: _lastNameController,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your surname';
                          }
                          return null;
                        },
                        decoration: InputDecoration(
                          labelText: 'Surname',
                          hintText: 'Enter your surname',
                          hintStyle: const TextStyle(color: Colors.grey),
                          border: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Email
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
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Diyetisyen için ek alan
                      if (!isConsultant)
                        Column(
                          children: [
                            TextFormField(
                              controller: _clinicController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your clinic/hospital';
                                }
                                return null;
                              },
                              decoration: InputDecoration(
                                labelText: 'Clinic/Hospital',
                                hintText: 'Enter your clinic or hospital',
                                hintStyle: const TextStyle(color: Colors.grey),
                                border: OutlineInputBorder(
                                  borderSide: const BorderSide(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(15.0),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(15.0),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20.0),
                          ],
                        ),

                      // Password
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
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderSide: const BorderSide(color: Colors.grey),
                            borderRadius: BorderRadius.circular(15.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20.0),

                      // Davet Kodu (Sadece Danışanlar için)
                      if (isConsultant)
                      Column(
                        children: [
                        TextFormField(
                          controller: _invitationCodeController,
                          decoration: InputDecoration(
                            labelText: 'Invitation Code',
                            hintText: 'Enter your invitation code',
                            hintStyle: const TextStyle(color: Colors.grey),
                            border: OutlineInputBorder(
                              borderSide: const BorderSide(color: Colors.grey),
                              borderRadius: BorderRadius.circular(15.0),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide: const BorderSide(color: Colors.grey),
                              borderRadius: BorderRadius.circular(15.0),
                            ),
                          ),
                        ),
                        ],
                      ),
                      const SizedBox(height: 20.0),

                      // Checkbox
                      Row(
                        children: [
                          Checkbox(
                            value: agreePersonalData,
                            onChanged: (bool? value) {
                              setState(() {
                                agreePersonalData = value!;
                              });
                            },
                            activeColor: const Color.fromARGB(255, 38, 111, 52),
                          ),
                          const Text(
                            'I agree to the terms and conditions',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20.0),

                      // Sign Up Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : () async {

                            if(!agreePersonalData) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Please agree to the terms and conditions'),
                                ),
                              );
                              return;
                            }
                            if (_formSignUpKey.currentState!.validate()) {
                              setState(() {
                                _isLoading = true; // Yükleniyor durumunu başlat
                              });
                              Map<String, dynamic> result;
                              if (isConsultant) {
                                result = await _authService.registerClient(
                                  _firstNameController.text,
                                  _lastNameController.text,
                                  _emailController.text,
                                  _passwordController.text,
                                  _invitationCodeController.text,
                                );
                              } else {
                                result = await _authService.registerDietitian(
                                  _firstNameController.text,
                                  _lastNameController.text,
                                  _emailController.text,
                                  _passwordController.text,
                                  _clinicController.text,
                            
                                );
                              }

                              if(!mounted) return;
                               // Widget hâlâ ekranda mı kontrolü
                              setState(() {
                                _isLoading = false; // Yükleniyor durumunu durdur
                              });

                              if (result['success'] == true) {
                                int userID = result['data']['userId'];

                                if(isConsultant){
                                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => ClientHomePage(userId: userID)));
                                } else {
                                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => DietitianHomePage(userId: userID)));
                                }
                              } else {
                                _showErrorDialog(result['message']);
                              }
                            }
      
                              // Burada kullanıcı tipine göre yönlendirme yapılabili
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                const Color.fromARGB(255, 125, 153, 92),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20.0),
                            ),
                          ),

                          child: _isLoading
                              ? const CircularProgressIndicator(
                                  color: Colors.white,
                                )
                              : const Text(
                                  'Sign Up',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18.0,
                                  ),
                                ),
                        ),
                      ),
                  
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
